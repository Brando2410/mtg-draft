import { GameState, PlayerId, GameObject, Zone, AbilityType, DurationType, EffectType, ParsedAbility } from '@shared/engine_types';
import { TriggerProcessor } from '../effects/TriggerProcessor';
import { RegistryProcessor } from '../core/RegistryProcessor';

/**
 * Physical Actions Handling (Rule 400/103)
 */
export class ActionProcessor {

  /**
   * CR 400.1 / 400.7: An object that moves from one zone to another 
   * becomes a new object with no memory of or relation to its previous existence.
   */
    public static moveCard(state: GameState, card: GameObject, to: Zone, targetPlayerId: PlayerId, log?: (m: string) => void, libraryPosition: 'top' | 'bottom' = 'top', isDraw: boolean = false, isDiscard: boolean = false) {
    const fromZone = card.zone;

    // Rule 400.3: Objects move to their OWNER'S hand/graveyard/library, not the controller's.
    const destinationPlayerId = (to === Zone.Hand || to === Zone.Graveyard || to === Zone.Library) ? card.ownerId : targetPlayerId;
    const effectiveTargetId = destinationPlayerId;

    // CR 701.8: To discard a card, move it from hand to graveyard.
    if ((isDiscard || (fromZone === Zone.Hand && to === Zone.Graveyard)) && !isDraw) {
        TriggerProcessor.onEvent(state, { type: 'ON_DISCARD', playerId: card.ownerId, data: { card: card } }, log || (() => {}));
    }
    
    // --- FLASHBACK REPLACEMENT EFFECT (Rule 702.34a) ---
    if (fromZone === Zone.Stack && to !== Zone.Exile && card.isFlashbackCast) {
        if (log) log(`[FLASHBACK] ${card.definition.name} was cast via flashback and is being exiled instead of moving to ${to}.`);
        to = Zone.Exile;
    }

    // --- DRAW REPLACEMENT EFFECT HOOK (Rule 614/616/121.6) ---
    if (isDraw && fromZone === Zone.Library && to === Zone.Hand && !(state as any).isResolvingDrawReplacement) {
        const registry = state.ruleRegistry;
        if (registry.replacementEffects) {
            for (const replacement of registry.replacementEffects) {
                if (replacement.id.includes('teferi_ageless_insight')) {
                    const isYourTurn = state.activePlayerId === effectiveTargetId;
                    const isYourDrawStep = isYourTurn && (state as any).currentStep === 'Draw';
                    const cardsDrawn = state.turnState.cardsDrawnThisTurn[effectiveTargetId] || 0;
                    const skipFirstDrawInDrawStep = isYourDrawStep && cardsDrawn === 0;

                    if (!skipFirstDrawInDrawStep) {
                        if (log) log(`[REPLACED] Teferi's Ageless Insight replaces draw with 2 draws.`);
                        (state as any).isResolvingDrawReplacement = true;
                        
                        // Rule 121.6: The draw is considered to have never happened.
                        // We must perform two separate draws instead.
                        // We draw the card that was supposed to be drawn, then another one.
                        this.moveCard(state, card, Zone.Hand, effectiveTargetId, log, libraryPosition, true);
                        
                        const player = state.players[effectiveTargetId];
                        if (player && player.library.length > 0) {
                            const nextCard = player.library.pop()!;
                            this.moveCard(state, nextCard, Zone.Hand, effectiveTargetId, log, 'top', true);
                        }
                        
                        (state as any).isResolvingDrawReplacement = false;
                        return; // Original draw call consumed/replaced
                    }
                }
            }
        }
    }

    // --- REPLACEMENT EFFECT HOOK (Rule 614/616) ---
    // Currently specialized for Containment Priest-style entry replacement.
    if (to === Zone.Battlefield && state.ruleRegistry.replacementEffects) {
        const isToken = (card as any).isToken || card.id.startsWith('token_');
        const types = card.definition.types.map(t => t.toLowerCase());

        for (const replacement of state.ruleRegistry.replacementEffects) {
             const source = state.battlefield.find(o => o.id === replacement.sourceId);
             if (!source || source.isPhasedOut) continue;

             if (replacement.id.toLowerCase().includes('containment_priest')) {
                 if (types.includes('creature') && !isToken && fromZone !== Zone.Stack) {
                     if (log) log(`[REPLACED] ${source.definition.name} exiles ${card.definition.name} (not cast).`);
                     to = Zone.Exile; // Divert destination!
                     break;
                 }
             }
        }
    }

    // Rule 110.2: A permanent's controller is the player under whose control it entered.
    // Rule 108.4: A card's owner doesn't change, but its controller can.
    card.controllerId = effectiveTargetId;

    // CR 603.10: "Leaves-the-battlefield" events MUST look back in time.
    // Trigger them while we still have the Battlefield state (counters, registered abilities).
    if (fromZone === Zone.Battlefield && to !== Zone.Battlefield) {
        this.handleLeavingBattlefield(state, card, to, log);
    }

    // 1. Rule 400.7: Remove from the current zone
    if (log) log(`[MOVE] ${card.definition.name} (${card.id}) from ${fromZone} to ${to} (isDraw: ${isDraw})...`);

    // Track original zone if moving to stack (Rule 400.7 memoization)
    if (to === Zone.Stack && fromZone !== Zone.Stack) {
        card.lastNonStackZone = fromZone;
    }

    this.removeFromCurrentZone(state, card);

    // 2. Rule 400.7: Reset characteristics and update zone
    card.zone = to;
    const isToken = (card as any).isToken || card.id.startsWith('token_');

    // Clear reveal status on ANY zone change (Rule 400.7)
    // Moving out of a hidden zone (like Hand) should always hide the card again unless the next zone is public
    (card as any).isRevealed = false;
    (card as any).revealed = false; 

    // Rule 400.7: Objects leaving the battlefield lose memory of their state
    if (to !== Zone.Battlefield) {
        this.resetObjectState(state, card, fromZone, to);
    }

    // 3. Rule 711.8: MDFC Face Handling
    if ((to === Zone.Battlefield || to === Zone.Stack) && (card as any).selectedFaceDefinition) {
        if (!(card as any).originalDefinition) {
            (card as any).originalDefinition = card.definition;
        }
        card.definition = (card as any).selectedFaceDefinition;
    }

    // 4. Rule 400.1: Add to the new zone
    if (log) log(`[MOVE-DEBUG] Adding ${card.definition.name} to ${to} for player ${effectiveTargetId}`);
    this.addToTargetZone(state, card, to, effectiveTargetId, isToken, fromZone, log, libraryPosition);

    // CR 121: Drawing a card
    if (isDraw && fromZone === Zone.Library && to === Zone.Hand) {
        state.turnState.cardsDrawnThisTurn[effectiveTargetId] = (state.turnState.cardsDrawnThisTurn[effectiveTargetId] || 0) + 1;
        state.turnState.lastCardsDrawnAmount = 1;
        TriggerProcessor.onEvent(state, { type: 'ON_DRAW', playerId: effectiveTargetId, data: { card } }, log || (() => {}));

        // Jolrael support: Emit ON_SECOND_DRAW
        if (state.turnState.cardsDrawnThisTurn[effectiveTargetId] === 2) {
            TriggerProcessor.onEvent(state, { type: 'ON_SECOND_DRAW', playerId: effectiveTargetId, data: { card } }, log || (() => {}));
        }
    }

    // SOS: Owlin Historian support
    if (fromZone === Zone.Graveyard && to !== Zone.Graveyard) {
        state.turnState.cardLeftGraveyardThisTurn[card.ownerId] = true;
        TriggerProcessor.onEvent(state, { type: 'ON_LEAVE_GRAVEYARD', playerId: card.ownerId, data: { card } }, log || (() => {}));
    }

    if (to === Zone.Exile) {
        state.turnState.cardsExiledThisTurn[card.ownerId] = true;
    }
  }

  private static handleLeavingBattlefield(state: GameState, card: GameObject, to: Zone, log?: (m: string) => void) {
      const types = card.definition.types.map(t => t.toLowerCase());
      
      // Rule 603.10a: "Dies" triggers (specifically for creatures moving to graveyard)
      if (to === Zone.Graveyard && types.includes('creature')) {
          state.turnState.creaturesDiedThisTurn.push(card);
          TriggerProcessor.onEvent(state, { type: 'ON_DEATH', targetId: card.id, sourceId: card.id, data: { object: card } }, log || (() => {}));
      }

      // General Leave trigger
      TriggerProcessor.onEvent(state, { type: 'ON_LEAVE_BATTLEFIELD', targetId: card.id, sourceId: card.id, data: { object: card, toZone: to } }, log || (() => {}));
  }

  public static removeFromCurrentZone(state: GameState, card: GameObject) {
    RegistryProcessor.unregisterAbilities(state, card.id);
    const cid = card.id;
    const beforeCount = state.battlefield.length;

    state.battlefield = state.battlefield.filter(c => c.id !== cid);

    const afterCount = state.battlefield.length;
    if (afterCount < beforeCount) {
        // Successfully removed
    }

    // Rule 113.7a: Abilities on the stack exist independently of their source.
    // We only remove the object from the stack if it IS the card (e.g. a Spell being countered/moved).
    state.stack = state.stack.filter(s => s.id !== cid && s.card?.id !== cid);
    state.exile = state.exile.filter(c => c.id !== cid);

    for (const pid in state.players) {
        const p = state.players[pid as PlayerId];
        p.hand = p.hand.filter(c => c.id !== cid);
        const isFromGrave = p.graveyard.some(c => c.id === cid);
        p.graveyard = p.graveyard.filter(c => c.id !== cid);
        if (isFromGrave) {
            state.turnState.cardLeftGraveyardThisTurn[pid] = true;
            TriggerProcessor.onEvent(state, { type: 'ON_LEAVE_GRAVEYARD', targetId: cid, sourceId: cid }, () => {});
        }
        p.library = p.library.filter(c => c.id !== cid);
    }
  }

   private static addToTargetZone(state: GameState, card: GameObject, to: Zone, targetPlayerId: PlayerId, isToken: boolean, from: Zone, log?: (m: string) => void, libraryPosition: 'top' | 'bottom' = 'top') {
    if (to === Zone.Battlefield) {
      state.battlefield.push(card);
      // Rule 110.2: Always sync controllerId when entering battlefield
      card.controllerId = targetPlayerId;
      
      // CR 302.6: Creature enters the battlefield with summoning sickness
      const isCreature = card.definition.types.some(t => t.toLowerCase() === 'creature');
      const hasHasteInDefinition = (card.definition.keywords || []).some(k => k.toLowerCase() === 'haste');
      const hasHasteOnCard = (card.keywords || []).some(k => k.toLowerCase() === 'haste');
      card.summoningSickness = isCreature && !hasHasteInDefinition && !hasHasteOnCard;
      
      let entersTapped = card.definition.entersTapped || false;
      if (card.definition.entersTappedCondition) {
          const { ConditionProcessor } = require('./../core/ConditionProcessor');
          if (ConditionProcessor.matchesCondition(state, card.definition.entersTappedCondition, card.id, targetPlayerId, { xValue: (card as any).xValue } as any)) {
              entersTapped = true;
          }
      }
      if (entersTapped) {
        card.isTapped = true;
      }
      card.isPrepared = card.definition.entersPrepared || false;
      (card as any).isRevealed = false; // Always clear when entering public zone
      RegistryProcessor.registerAbilities(state, card);
      
      this.handleEnteringBattlefield(state, card, from, log);

    } else if (to === Zone.Stack) {
      // Rule 405: The Stack
      // Note: High-level processors (SpellProcessor) handle pushing the complex StackObject.
      // We just ensure abilities are registered for the card in this zone.
      RegistryProcessor.registerAbilities(state, card);
    } else if (to === Zone.Exile) {
        state.exile.push(card);
        card.controllerId = targetPlayerId;
        RegistryProcessor.registerAbilities(state, card);
    } else {
      const player = state.players[targetPlayerId];
      if (!player) return;

      card.controllerId = targetPlayerId;

      if (to === Zone.Hand && !isToken) player.hand.push(card);
      else if (to === Zone.Library && !isToken) {
          if (libraryPosition === 'bottom') player.library.unshift(card);
          else player.library.push(card);
      }
      else if (to === Zone.Graveyard) {
          player.graveyard.push(card);
          this.handleEnteringGraveyard(state, card, from, log);
      }
      
      RegistryProcessor.registerAbilities(state, card);
    }
  }

  private static resetObjectState(state: GameState, card: GameObject, from: Zone, to: Zone) {
    if (from === Zone.Battlefield) {
        RegistryProcessor.unregisterAbilities(state, card.id);
        if (to === Zone.Hand) {
            state.turnState.permanentReturnedToHandThisTurn = true;
            state.turnState.playersWithPermanentReturnedThisTurn[card.ownerId] = true;
        }
    }

    // Rule 400.7: Object changes zones -> becomes a new object
    // 1. Clear floating continuous effects tied to this object
    state.ruleRegistry.continuousEffects = state.ruleRegistry.continuousEffects.filter(eff => {
        // Rule 611.2a: Floating effects (UntilEndOfTurn, UntilEndOfCombat) do NOT depend on the source card staying in the zone.
        // We only clear effects that are tied to the presence of the object (Static) or reach their natural expiry.
        if (eff.sourceId === card.id) {
            if (
                eff.duration.type === DurationType.UntilEndOfTurn || 
                eff.duration.type === DurationType.UntilEndOfCombat ||
                eff.duration.type === DurationType.UntilEvent ||
                eff.duration.type === DurationType.Permanent
            ) {
                return true; // Keep floating/permanent effects!
            }
            // Default: Remove non-floating effects sourced from this object if it leaves the zone (e.g. STATIC)
            return false; 
        }
        
        // Remove this object from target lists
        if (eff.targetIds && eff.targetIds.includes(card.id)) {
            eff.targetIds = eff.targetIds.filter(id => id !== card.id);
        }
        return true;
    });

    // 2. Reset dynamic engine properties
    const c = card as any;
    c.isTapped = false;
    c.damage = 0;
    c.damageMarked = 0;
    c.deathtouchMarked = false;
    c.isAttacking = false;
    c.isBlocking = false;
    c.summoningSickness = false;
    c.isPhasedOut = false;
    c.isRevealed = false; // Rule 400.7: Clear revealed status on zone change
    c.counters = {};
    c.attachedTo = undefined;
    c.isGoaded = false;
    
    // Rule 711.4a: MDFC reverts to front face in non-battlefield/stack zones
    if (to !== Zone.Battlefield && to !== Zone.Stack) {
        if ((card as any).originalDefinition) {
            card.definition = (card as any).originalDefinition;
            (card as any).originalDefinition = undefined;
        }
        if ((card as any).selectedFaceDefinition) {
            (card as any).selectedFaceDefinition = undefined;
        }
    }
    c.faceDown = false;
    
    // Rule 107.3: The value of X is preserved as long as the object is on the stack or battlefield.
    // If it moves to Hand, Graveyard, Library, or Exile, it must be reset.
    if (to !== Zone.Stack && to !== Zone.Battlefield) {
        c.xValue = undefined;
    }

    // Rule 400.7: Objects leaving the battlefield/stack lose their identity 
    // BUT we preserve lastNonStackZone if moving TO the Battlefield from Stack 
    // to allow ETB triggers to know where the spell was cast from.
    if (to !== Zone.Battlefield && to !== Zone.Stack) {
        delete card.lastNonStackZone;
    }
    
    // 3. Wipe calculated stats (they will be recalculated for the new zone)
    c.effectiveStats = null;
    c.modifierSnapshot = null;
  }

  private static handleEnteringBattlefield(state: GameState, card: GameObject, fromZone: Zone, log?: (m: string) => void) {
    // Replacement-style entry counters for X costs (Rule 122.6)
    if (card.xValue && (card.definition as any).entersWithXCounters) {
        card.counters['+1/+1'] = (card.counters['+1/+1'] || 0) + card.xValue;
        if (log) log(`[X-COST] ${card.definition.name} enters with ${card.xValue} +1/+1 counters.`);
    }
    
    // Generic 'Enters with counters' support (Rule 614.1c)
    const staticAbilities = (card.definition.abilities || []).filter(a => typeof a !== 'string' && a.type === AbilityType.Static) as ParsedAbility[];
    staticAbilities.forEach(a => {
        a.effects?.forEach((e: any) => {
            if (e.type === 'EntersWithCounters' || e.type === EffectType.EntersWithCounters) {
                const type = e.counterType || 'P1P1';
                let amount = 0;
                if (e.amount === 'CONVERGE_AMOUNT') {
                    amount = (card as any).convergeAmount || 0;
                } else if (e.amount === 'THREE_MINUS_X') {
                    amount = Math.max(0, 3 - ((card as any).xValue || 0));
                } else if (e.amount === 'X') {
                    amount = (card as any).xValue || 0;
                } else {
                    amount = typeof e.amount === 'number' ? e.amount : 0;
                }
                
                if (amount > 0) {
                    const counterKey = type === 'P1P1' ? '+1/+1' : type;
                    card.counters[counterKey] = (card.counters[counterKey] || 0) + amount;
                    if (log) log(`[ETB-COUNTERS] ${card.definition.name} enters with ${amount} ${counterKey} counters.`);
                }
            }
        });
    });


    // Rule 603.6a: Enters-the-battlefield triggers
    TriggerProcessor.onEvent(state, { type: 'ON_ETB', targetId: card.id, sourceId: card.id, sourceZone: fromZone, data: { object: card } }, log || (() => {}));

    // Rule 306.5b: Planeswalkers enter with loyalty counters
    if (card.definition.types.some(t => {
        const type = String(t).toLowerCase();
        return type === 'planeswalker';
    })) {
        const def = card.definition as any;
        let loyaltyValue = def.loyalty;

        // Fallback to Oracle if missing
        if (loyaltyValue === undefined || loyaltyValue === null) {
            const { oracle } = require('../../OracleLogicMap');
            const logic = oracle.getCard(card.definition.name);
            if (logic) {
                loyaltyValue = logic.loyalty;
            }
        }

        const startingLoyalty = parseInt(String(loyaltyValue || "0"), 10);
        
        if (log) {
            log(`[DEBUG-LOYALTY] ${card.definition.name} - Found loyalty: ${loyaltyValue} (Source: ${def.loyalty ? 'Definition' : 'Oracle Fallback'})`);
            log(`[DEBUG-DEF] Keys: ${Object.keys(def).join(', ')}`);
        }

        card.counters['loyalty'] = startingLoyalty;
        if (log) log(`[ETB] ${card.definition.name} enters with ${startingLoyalty} loyalty.`);
    }
  }

  private static handleEnteringGraveyard(state: GameState, card: GameObject, from: Zone, log?: (m: string) => void) {
      this.resetObjectState(state, card, from, Zone.Graveyard);
  }

  /* --- Turn Actions (Rule 500) --- */

  /**
   * CR 502.2: The Untap Step
   * The active player untaps all permanents they control.
   */
  public static untapAll(state: GameState, playerId: PlayerId, log?: (m: string) => void) {
    let count = 0;
    
    // CR 702.26a: All phased-out permanents that player controlled... phase in.
    state.battlefield.forEach(obj => {
       if (obj.controllerId === playerId && obj.isPhasedOut) {
          obj.isPhasedOut = false;
          if (log) log(`${obj.definition.name} phased in.`);
       }
    });

    state.battlefield.forEach(obj => {
      if (obj.controllerId === playerId) {
        // Rule 502.1: Check for restrictions that prevent untapping
        const { LayerProcessor } = require('../state/LayerProcessor');
        const stats = LayerProcessor.getEffectiveStats(obj, state);
        if (stats.keywords.includes('CannotUntap') || (obj as any).cannotUntapThisTurn) {
            if (log) log(`${obj.definition.name} does not untap.`);
            return;
        }

        if (obj.isTapped || (obj.counters['stun'] && obj.counters['stun'] > 0)) {
            if (obj.counters['stun'] && obj.counters['stun'] > 0) {
                obj.counters['stun']--;
                if (log) log(`${obj.definition.name} removed a stun counter and remains tapped.`);
                return;
            }
            obj.isTapped = false;
            count++;
        }
        // CR 302.6: Summoning sickness wears off at the beginning of the controller's turn
        obj.summoningSickness = false;
      }
    });

    if (log && count > 0) log(`${count} permanents untapped.`);
  }
  
  public static shuffle(array: any[]) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
  }
}
