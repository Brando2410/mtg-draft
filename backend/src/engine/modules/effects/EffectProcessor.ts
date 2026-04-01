import { GameState, EffectDefinition, GameObjectId, PlayerId, Zone, GameObject, ContinuousEffect, DurationType, EmblemDefinition, TriggeredAbility } from '@shared/engine_types';
import { ActionProcessor } from '../actions/ActionProcessor';
import { DamageProcessor } from '../combat/DamageProcessor';
import { ValidationProcessor } from '../state/ValidationProcessor';
import { ManaProcessor } from '../magic/ManaProcessor';
import { LayerProcessor } from '../state/LayerProcessor';
import { TriggerProcessor } from './TriggerProcessor';
import { ChoiceGenerator } from './ChoiceGenerator';

/**
 * Rules Engine Module: Effect Resolution (Rule 608/609)
 * Interprets EffectDefinitions and translates them into GameState mutations.
 * 
 * DESIGN: Strategy Pattern for effect execution.
 */
export class EffectProcessor {

  public static resolveEffects(
    state: GameState, 
    effects: EffectDefinition[], 
    sourceId: GameObjectId, 
    targets: string[], 
    log: (m: string) => void,
    startIndex: number = 0,
    stackObject?: any,
    parentContext?: any
  ): boolean {
    log(`[RESOLVE-EFFECTS] Starting from index ${startIndex}/${effects.length}. Targets: ${targets.join(', ')}`);
    for (let i = startIndex; i < effects.length; i++) {
        const effect = effects[i];
        this.executeEffect(state, effect, sourceId, targets, log, stackObject, parentContext);
        
        // If an effect creates a pending action (like Choice), suspend resolution.
        if (state.pendingAction) {
            const isTargeting = state.pendingAction.type === 'TARGETING';
            state.pendingAction.data = {
                ...state.pendingAction.data,
                nextEffectIndex: isTargeting ? i : i + 1, // Resume at SAME effect for targeting, NEXT for choice
                sourceId: sourceId,
                targets: targets,
                effects: effects,
                stackObj: stackObject,
                parentContext: parentContext
            };
            state.priorityPlayerId = state.pendingAction.playerId;
            return false;
        }
    }
    return true;
  }

  private static executeEffect(
    state: GameState, 
    effect: EffectDefinition, 
    sourceId: GameObjectId, 
    targets: string[], 
    log: (msg: string) => void,
    stackObject?: any,
    parentContext?: any
  ) {
    const sourceObj = this.findObject(state, sourceId, stackObject, parentContext) || (stackObject?.card ? stackObject.card : stackObject);
    const controllerId = sourceObj?.controllerId || state.activePlayerId;
    log(`[EXECUTE-EFFECT] Type: ${effect.type}. Mapping: ${(effect as any).targetMapping}. Targets in context: ${targets.join(', ')}`);

    // --- CR 601.2c / 608.2b: TARGETING FOR MID-SPELL EFFECTS ---
    // If an effect has a targetDefinition but no target has been selected yet (length 0),
    // it means this effect is part of a complex spell (like a choice) that needs a NEW targeting phase.
    if ((effect as any).targetDefinition && targets.length === 0) {
        const targetDef = (effect as any).targetDefinition;
        const legalTargetIds = this.getLegalTargetIdsForEffect(state, sourceId, targetDef, stackObject);
        
        if (legalTargetIds.length === 0) {
            log(`[RESOLVING] No legal targets found for ${effect.type}${!targetDef.optional ? ' (Mandatory)' : ''}. Skipping sub-effect.`);
            // CR 608.2b: If no legal targets exist, the effect fails to apply. 
            // We return here to skip the rest of this SPECIFIC effect list (like a choice branch), 
            // which will trigger the parent context resumption logic.
            return;
        }

        state.pendingAction = {
            type: 'TARGETING',
            playerId: controllerId,
            sourceId: sourceId,
            data: {
                targetDefinition: targetDef,
                targets: [],
                legalTargetIds: legalTargetIds,
                stackObj: stackObject, // Preserve context
                parentContext: parentContext // Keep resolution chain
            }
        };
        log(`[RESOLVING] ${state.players[controllerId]?.name} must select a target for ${effect.type}.`);
        return; // SUSPEND RESOLUTION
    }

    let resolvedTargetIds = this.resolveTargetMapping(state, (effect as any).targetMapping || "", targets, sourceId, controllerId, stackObject?.data, effect);
    if ((effect as any).targetId) resolvedTargetIds = [(effect as any).targetId]; // Override if hardcoded specifically for this sub-action
    
    // CR 608.2b: Targeted effects only apply to targets that are still legal.
    const validTargetIds = resolvedTargetIds.filter(tid => {
        if (!tid) return false;
        if (state.players[tid]) return true; // Keep players
        const obj = this.findObject(state, tid, stackObject, parentContext);
        if (!obj) return false;
        
        if (['TARGET_1', 'TARGET_2', 'TARGET_ALL', 'TARGET_1_CONTROLLER', 'TARGET_1_OPPONENT', 'EVENT_TARGET'].includes(effect.targetMapping || "")) {
            const tempStackObj = state.stack.find(s => s.id === (state as any).lastResolvedStackId || s.sourceId === sourceId) || stackObject;
            const targetDef = (effect as any).targetDefinition || tempStackObj?.data?.targetDefinition;
            if (!targetDef) return true; // SELECTED/CHOICE result, skip formal targeting validation
            return ValidationProcessor.isLegalTarget(state, (sourceObj as any) || (sourceId as any), tid, targetDef);
        }
        return true;
    });

    if (resolvedTargetIds.length > 0 && validTargetIds.length === 0) {
        // If it was targeted but all targets became invalid, skip this specific effect.
        return;
    }

    let amount = (effect as any).amount !== undefined 
        ? this.resolveAmount(state, effect.amount, sourceId, controllerId, stackObject)
        : 1; // Default to 1 if amount is not specified in data (MTG: "a" token, "a" card, etc.)

    // --- CR 608.2: EVALUATE CONDITIONS ---
    if (effect.condition) {
        if (effect.condition === 'targetWasCreature') {
            const firstTargetId = targets[0]; // TARGET_1
            const targetObj = this.findObject(state, firstTargetId, stackObject, parentContext);
            const isCreature = targetObj?.definition.types.some(t => t.toLowerCase() === 'creature');
            if (!isCreature) {
                log(`[RESOLVING] Condition NOT met: ${firstTargetId} is not a creature card. Skipping ${effect.type}.`);
                return; 
            }
        }
        if (effect.condition === 'notCastFromHand') {
            const card = (stackObject as any)?.card;
            if (card && card.lastNonStackZone === Zone.Hand) {
                log(`[RESOLVING] Condition NOT met: Spell was cast from hand. Skipping ${effect.type}.`);
                return;
            }
        }
        if (effect.condition === 'castFromHand') {
            const card = (stackObject as any)?.card;
            if (card && card.lastNonStackZone !== Zone.Hand) {
                log(`[RESOLVING] Condition NOT met: Spell was NOT cast from hand. Skipping ${effect.type}.`);
                return;
            }
        }
    }

    // CR 609: Effect Strategy Dispatcher
    switch (effect.type) {
      case 'DrawCards':           this.handleDrawCards(state, validTargetIds, amount, log); break;
      case 'DiscardCards':        this.handleDiscardCards(state, validTargetIds, amount, sourceId, log); break;
      case 'DealDamage':          this.handleDealDamage(state, validTargetIds, amount, sourceId, log); break;
      case 'Exile':               this.handleExile(state, validTargetIds, sourceId, log, stackObject, parentContext); break;
      case 'ExileAllCards':       this.handleExileAllCards(state, validTargetIds, effect, log); break;
      case 'CopySpellOnStack':    this.handleCopySpellOnStack(state, validTargetIds, controllerId, log); break;
      case 'ReturnToHand':        this.handleReturnToHand(state, validTargetIds, log, stackObject, parentContext); break;
      case 'PhasedOut':           this.handlePhasedOut(state, validTargetIds, effect.value !== false, log, stackObject, parentContext); break;
      case 'Destroy':             this.handleDestroy(state, validTargetIds, log, stackObject, parentContext); break;
      case 'GainLife':            this.handleGainLife(state, validTargetIds, amount, log); break;
      case 'LoseLife':            this.handleLoseLife(state, validTargetIds, amount, log); break;
      case 'AddCounters':         this.handleAddCounters(state, validTargetIds, amount, effect.value || '+1/+1', log); break;
      case 'CreateToken': {
          let p = (effect as any).powerOverride !== undefined ? this.resolveAmount(state, (effect as any).powerOverride, sourceId, controllerId, stackObject) : undefined;
          let t = (effect as any).toughnessOverride !== undefined ? this.resolveAmount(state, (effect as any).toughnessOverride, sourceId, controllerId, stackObject) : undefined;
          this.handleCreateToken(state, validTargetIds, amount, (effect as any).tokenBlueprint, log, p, t); 
          break;
      }
      case 'SearchLibrary':       this.handleSearchLibrary(state, validTargetIds, effect, sourceId, log); break;
      case 'CreateEmblem':        this.handleCreateEmblem(state, effect, controllerId, sourceId, log); break;
      case 'ApplyContinuousEffect': this.handleApplyContinuousEffect(state, effect, sourceId, validTargetIds, log, stackObject); break;
      case 'Choice':              this.handleChoice(state, effect, sourceId, validTargetIds, log, stackObject, parentContext); break;
      case 'LookAtTopAndPick':     this.handleLookAtTopAndPick(state, effect, sourceId, validTargetIds, log, stackObject, parentContext); break;
      case 'MoveToZone':           this.handleMoveToZone(state, effect, log, stackObject, parentContext); break;
      case 'PutRemainderOnBottomRandom': this.handlePutRemainderOnBottomRandom(state, effect, log, stackObject, parentContext); break;
      case 'Scry':                this.handleScry(state, validTargetIds, amount, sourceId, log); break;
      case 'Sacrifice':            this.handleSacrifice(state, validTargetIds, sourceId, log); break;
      case 'AddTriggeredAbility':  this.handleAddTriggeredAbility(state, effect, sourceId, log); break;
      case 'Fight':                this.handleFight(state, validTargetIds, log); break;
      case 'AddPreventionEffect':  this.handleAddPreventionEffect(state, effect, sourceId, log); break;
      case 'Shuffle':              this.shuffleLibrary(state.players[validTargetIds[0] as PlayerId], log); break;
      case 'Log':                  log(effect.message || ""); break;
      default:
        log(`[WARNING] Effect type ${effect.type} not yet implemented.`);
      }
  }

  private static shuffleLibrary(player: any, log: (m: string) => void) {
      if (!player) return;
      for (let i = player.library.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [player.library[i], player.library[j]] = [player.library[j], player.library[i]];
      }
      log(`[SHUFFLE] ${player.name} shuffled their library.`);
  }

  private static handleSearchLibrary(state: GameState, targets: string[], effect: any, sourceId: string, log: (m: string) => void) {
      const playerId = targets[0] || state.activePlayerId;
      const player = state.players[playerId];
      if (!player) return;

      // Filter library for legal cards - Rule 701.19
      const restrictions = effect.targetDefinition?.restrictions || [];
      const validCards = player.library.filter(c => 
          ValidationProcessor.matchesRestrictions(state, c, restrictions, player.id, sourceId)
      );

      log(`[SEARCH] ${player.name} is searching their library...`);

      // 1. Create a Choice Action
      state.pendingAction = ChoiceGenerator.createCardChoice(state, player.library, {
          label: effect.label || `Choose ${restrictions.join(', ') || 'a card'} from your library`,
          playerId: player.id,
          sourceId: sourceId,
          restrictions: restrictions,
          optional: effect.optional !== false,
          hideUndo: true,
          onSelected: (c) => {
              const results = [];
              if (effect.reveal) {
                  results.push({ type: 'Log', message: `[REVEAL] ${player.name} reveals ${c.definition.name} from library.` } as any);
              }
              
              // Destination Logic (Default to Hand)
              const dest = effect.destination || 'Hand';
              const zoneMap: Record<string, any> = { 'Hand': Zone.Hand, 'Battlefield': Zone.Battlefield, 'Graveyard': Zone.Graveyard };
              results.push({ type: 'MoveToZone', targetId: c.id, zone: zoneMap[dest] || Zone.Hand } as any);

              if (effect.shuffle !== false) {
                  results.push({ type: 'Shuffle', targetId: player.id } as any);
              }

              return results;
          },
          onNone: () => {
              if (effect.shuffle !== false) {
                  return [{ type: 'Shuffle', targetId: player.id } as any];
              }
              return [];
          }
      });
  }

  private static handleAddTriggeredAbility(state: GameState, effect: any, sourceId: string, log: (m: string) => void) {
      const sourceObj = state.battlefield.find(o => o.id === sourceId) || state.players[sourceId as any];
      const controllerId = (sourceObj as any)?.controllerId || (state.activePlayerId);

      const trigger: TriggeredAbility = {
          id: `delayed_trigger_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          sourceId: sourceId,
          controllerId: controllerId,
          eventMatch: effect.eventMatch || effect.on,
          activeZone: 'Any',
          duration: { type: (effect.duration || 'UNTIL_END_OF_TURN') as any },
          ...effect
      };

      state.ruleRegistry.triggeredAbilities.push(trigger);
      log(`[DELAYED-TRIGGER] A new trigger was registered until end of turn.`);
  }

  private static handleAddPreventionEffect(state: GameState, effect: any, sourceId: string, log: (m: string) => void) {
      const sourceObj = this.findObject(state, sourceId);
      const controllerId = (sourceObj as any)?.controllerId || state.activePlayerId;

      const prevention: any = {
          id: `prevention_${Date.now()}_${Math.random()}`,
          sourceId,
          controllerId,
          damageType: effect.damageType || 'CombatDamage',
          targetMapping: effect.targetMapping,
          duration: effect.duration || 'UntilEndOfTurn'
      };

      if (!state.ruleRegistry.preventionEffects) state.ruleRegistry.preventionEffects = [];
      state.ruleRegistry.preventionEffects.push(prevention);
      log(`[PREVENTION] ${prevention.damageType} to ${prevention.targetMapping} will be prevented this turn.`);
  }

  /* --- Concrete Effect Handlers (CR 609) --- */

  private static handleScry(state: GameState, targets: string[], amount: number, sourceId: string, log: (m: string) => void) {
    targets.forEach(pid => {
        const player = state.players[pid];
        if (!player || player.library.length === 0) return;

        // Take top N cards
        const cards: any[] = [];
        for (let i = 0; i < amount && player.library.length > 0; i++) {
            cards.push(player.library.pop()!);
        }

        if (amount === 1) {
            const card = cards[0];
            state.pendingAction = ChoiceGenerator.createModalChoice(
                { label: `Scry: ${card.definition.name}`, playerId: pid, sourceId, hideUndo: true },
                [
                    { label: "Keep on Top", value: "top", effects: [{ type: 'MoveToZone', targetId: card.id, zone: Zone.Library, position: 'top' }] },
                    { label: "Put on Bottom", value: "bottom", effects: [{ type: 'MoveToZone', targetId: card.id, zone: Zone.Library, position: 'bottom' }] }
                ]
            );
            if (state.pendingAction) {
                (state.pendingAction.data as any).cardData = card; // Special hint for UI
            }
            log(`${player.name} is scrying...`);
        } else {
            // For N > 1, we put them all back on top in original order for now (simple implementation)
            // A full implementation would need a sorting UI.
            for (let i = cards.length - 1; i >= 0; i--) {
                player.library.push(cards[i]);
            }
            log(`[SCRY] ${player.name} scries ${amount}. (N > 1 returned to top)`);
        }
    });
  }


  private static handleLookAtTopAndPick(
    state: GameState, 
    effect: any, 
    sourceId: string, 
    resolvedTargetIds: string[], 
    log: (m: string) => void,
    stackObject?: any,
    parentContext?: any
  ) {
    const controllerId = resolvedTargetIds[0] || state.activePlayerId;
    const player = state.players[controllerId];
    if (!player) return;

    let amount = this.resolveAmount(state, effect.amount, sourceId, controllerId, stackObject);
    if (amount <= 0) return;
    
    // Explicitly type 'cards' to avoid any/any[] implicit errors
    const cards: GameObject[] = [];
    for (let i = 0; i < amount && player.library.length > 0; i++) {
        cards.push(player.library.pop()!); // MTG: "Look from top" is pop from the end of the array
    }

    if (cards.length === 0) return;

    log(`[LOOK] ${player.name} looks at the top ${cards.length} cards of their library.`);

    state.pendingAction = ChoiceGenerator.createCardChoice(state, cards, {
        label: `Scegli una carta (${cards.length} viste)`,
        playerId: controllerId,
        sourceId: sourceId,
        restrictions: effect.restrictions,
        reveal: effect.reveal,
        optional: effect.optional,
        hideUndo: effect.hideUndo !== undefined ? effect.hideUndo : true,
        onSelected: (c) => [
            { type: 'MoveToZone', targetId: c.id, zone: Zone.Hand, reveal: effect.reveal },
            { type: 'PutRemainderOnBottomRandom', cardsToMoveIds: cards.filter(other => other.id !== c.id).map(o => o.id) }
        ],
        onNone: () => [
            { type: 'PutRemainderOnBottomRandom', cardsToMoveIds: cards.map(o => o.id) }
        ]
    });

    log(`[LOOK] ${player.name} is choosing a card from the top ${cards.length}.`);
  }


  private static handleMoveToZone(state: GameState, effect: any, log: (m: string) => void, stackObject?: any, parentContext?: any) {
      const targetId = effect.targetId;
      let targetObj = this.findObject(state, targetId, stackObject, parentContext);
      
      if (!targetObj) {
          log(`[WARNING] handleMoveToZone: Target ${targetId} not found in any zone (including temporary).`);
          return;
      }

      ActionProcessor.moveCard(state, targetObj, effect.zone, targetObj.ownerId, log);
      
      // Set reveal flag AFTER moveCard so it doesn't get wiped by resetObjectState (Rule 400.7 logic)
      if (effect.reveal) {
          log(`[REVEAL] ${state.players[targetObj.ownerId]?.name} reveals ${targetObj.definition.name}.`);
          (targetObj as any).isRevealed = true; // Set reveal flag (eye icon in UI)
      }
  }


  private static handlePutRemainderOnBottomRandom(state: GameState, effect: any, log: (m: string) => void, stackObject?: any, parentContext?: any) {
      const cardIds = effect.cardsToMoveIds || [];
      if (cardIds.length === 0) return;

      // 1. Locate all card objects using the robust lookup
      const cards = cardIds.map((id: string) => {
          return this.findObject(state, id, stackObject, parentContext);
      }).filter(Boolean);


      // 2. Shuffle them
      for (let i = cards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [cards[i], cards[j]] = [cards[j], cards[i]];
      }

      // 3. Put them at the BOTTOM of the library using the new position protocol
      cards.forEach((c: any) => {
          c.libraryPosition = 'bottom';
          ActionProcessor.moveCard(state, c, Zone.Library, c.ownerId, log);
      });
      
      log(`[RANDOM] Put ${cards.length} cards on the bottom of the library in a random order.`);
  }



  private static handleChoice(state: GameState, effect: any, sourceId: string, targets: string[], log: (m: string) => void, stackObject?: any, parentContext?: any) {
    const sourceObj = this.findObject(state, sourceId, stackObject) || stackObject?.card || stackObject;
    if (!sourceObj) return;

    // --- SUPPORT FOR PRE-SELECTED CHOICES (MODAL SETUP) ---
    // If the spell was popped from the stack for resolution, it's passed here directly.
    const preSelectedIdx = stackObject?.data?.preSelectedChoice;

    if (preSelectedIdx !== undefined) {
        const choice = effect.choices[preSelectedIdx];
        if (choice && choice.effects) {
            log(`[RESOLVING CHOICE] Auto-resolved pre-selected mode: ${choice.label}`);
            this.resolveEffects(state, choice.effects, sourceId, targets, log, 0, stackObject, parentContext);
        }
        return;
    }

    const controllerId = sourceObj.controllerId || state.activePlayerId;
    let dynamicChoices = effect.choices;

    // --- HAND-PICKING OR GRAVEYARD-PICKING ---
    const targetZoneMapping = (effect as any).targetIdMapping;
    if (['TARGET_1_HAND', 'TARGET_1_GRAVEYARD', 'CONTROLLER_HAND', 'CONTROLLER_GRAVEYARD'].includes(targetZoneMapping) && !dynamicChoices) {
        let targetPlayerId: string | undefined;
        
        if (targetZoneMapping.startsWith('TARGET_1_')) {
            targetPlayerId = targets[0];
            if (!targetPlayerId) {
                targetPlayerId = Object.keys(state.players).find(pid => pid !== controllerId);
            }
        } else {
            targetPlayerId = controllerId;
        }

        const targetPlayer = state.players[targetPlayerId as PlayerId];
        if (targetPlayer) {
            const isGraveyard = targetZoneMapping.endsWith('_GRAVEYARD');
            const sourceCards = isGraveyard ? targetPlayer.graveyard : targetPlayer.hand;
            
            if (targetZoneMapping === 'TARGET_1_HAND') {
                targetPlayer.hand.forEach((c: any) => c.isRevealed = true);
                log(`[REVEAL] Hand of ${targetPlayer.name} revealed.`);
            }

            state.pendingAction = ChoiceGenerator.createCardChoice(state, sourceCards, {
                label: effect.label || (targetZoneMapping === 'TARGET_1_GRAVEYARD' ? 'Scegli una Carta dal Cimitero' : 'Scegli una Carta dalla Mano'),
                playerId: controllerId,
                sourceId: sourceId,
                restrictions: effect.restrictions,
                optional: effect.optional !== false,
                hideUndo: effect.hideUndo !== undefined ? effect.hideUndo : true,
                onSelected: (c) => effect.effects,
                onNone: () => []
            });
            const parts = targetZoneMapping.split('_');
            const zoneName = parts[parts.length - 1].toLowerCase();
            log(`[CHOICE] ${state.players[controllerId]?.name} must choose a card from ${targetPlayer.name}'s ${zoneName}.`);
            return;
        }
    }

    // --- GENERIC MODAL CHOICES ---
    state.pendingAction = ChoiceGenerator.createModalChoice(
        { 
            label: effect.label || 'Scegli un\'Opzione', 
            playerId: controllerId, 
            sourceId: sourceId, 
            hideUndo: effect.hideUndo !== undefined ? effect.hideUndo : true
        },
        dynamicChoices || []
    );

    log(`[CHOICE] ${state.players[controllerId]?.name} must choose: ${effect.label || 'an option'}`);
  }

  private static handleDrawCards(state: GameState, targets: string[], amount: number, log: (m: string) => void) {
    targets.forEach(pid => {
        const player = state.players[pid];
        if (!player) return;
        for (let i = 0; i < amount; i++) {
            if (player.library.length > 0) {
                ActionProcessor.moveCard(state, player.library.pop()!, Zone.Hand, pid, log);
            } else {
                log(`${player.name} tried to draw from an empty library!`);
            }
        }
        log(`${player.name} draws ${amount} cards.`);
    });
  }

  private static handleDiscardCards(state: GameState, targets: string[], amount: number, sourceId: string, log: (m: string) => void) {
    targets.forEach(id => {
        // 1. Check if the target is a Player (Standard Discard)
        const player = state.players[id];
        if (player) {
            if (amount === -1) {
                const handCount = player.hand.length;
                while (player.hand.length > 0) {
                    ActionProcessor.moveCard(state, player.hand[0], Zone.Graveyard, id, log);
                }
                log(`${player.name} discarded their hand.`);
            } else if (amount > 0) {
                state.pendingAction = { type: 'DISCARD', playerId: id, sourceId, data: { amount } };
                player.pendingDiscardCount = amount;
                log(`${player.name} must discard ${amount} card(s).`);
            }
            return;
        }

        // 2. Check if the target is a specific Card (e.g. Duress, SELECTED_CARD)
        // Rule 701.8a: "To discard a card" can mean choosing one or moving a specific one to the graveyard.
        const obj = this.findObject(state, id);
        if (obj) {
            const owner = state.players[obj.ownerId];
            if (owner && owner.hand.some(c => c.id === obj.id)) {
                ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.ownerId, log);
                log(`${owner.name} discarded ${obj.definition.name}.`);
            }
        }
    });
  }

  private static handleDealDamage(state: GameState, targets: string[], amount: number, sourceId: string, log: (m: string) => void) {
    targets.forEach(tid => DamageProcessor.dealDamage(state, sourceId, tid, amount, false, log));
  }

  private static handleCopySpellOnStack(state: GameState, targets: string[], controllerId: string, log: (m: string) => void) {
      targets.forEach(tid => {
          const stackObj = state.stack.find(s => s.id === tid || s.sourceId === tid);
          if (!stackObj) return;

          const copy = JSON.parse(JSON.stringify(stackObj)); // Deep copy to avoid reference issues
          copy.id = `copy_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          (copy as any).isCopy = true;
          copy.controllerId = controllerId;

          state.stack.push(copy);
          log(`[COPY] Created copy of ${stackObj.card?.definition.name || 'spell'}.`);

          if (copy.data?.targetDefinition) {
              const targetDef = copy.data.targetDefinition;
              const legalTargetIds = [
                  ...Object.keys(state.players),
                  ...state.battlefield.map(o => o.id),
                  ...state.stack.map(s => s.id)
              ].filter(tid => ValidationProcessor.isLegalTarget(state, copy.id, tid, targetDef));

              state.pendingAction = {
                  type: 'TARGETING' as any,
                  playerId: controllerId,
                  sourceId: copy.id,
                  data: {
                      targetDefinition: targetDef,
                      legalTargetIds,
                      optional: true, // Rule 706.10c: "You may choose new targets"
                      originalTargets: [...copy.targets]
                  }
              };
              log(`[COPY] ${state.players[controllerId].name} may choose new targets for the copy.`);
          }
      });
  }

  private static handleExileAllCards(state: GameState, targets: string[], effect: any, log: (m: string) => void) {
      targets.forEach(tid => {
          const player = state.players[tid];
          if (!player) return;

          const cardsToExile = [...(player.graveyard || [])];
          if (cardsToExile.length === 0) {
              log(`${player.name}'s graveyard is empty.`);
              return;
          }

          // Rule 121: Iterating over snapshot to avoid modification issues
          [...cardsToExile].forEach(card => {
              ActionProcessor.moveCard(state, card, Zone.Exile, card.ownerId, log);
          });
          log(`Exiled all ${cardsToExile.length} cards from ${player.name}'s graveyard.`);
      });
  }

  private static handleExile(state: GameState, targets: string[], sourceId: string, log: (m: string) => void, stackObject?: any, parentContext?: any) {
    targets.forEach(tid => {
        const player = Object.values(state.players).find(p => p.id === tid);
        if (player) {
            // Player exile effect (e.g. discard to exile) - not standard MTG but here for logic
            return;
        }

        const stackIdx = state.stack.findIndex(s => s.id === tid || s.sourceId === tid);
        if (stackIdx !== -1) {
            const card = state.stack[stackIdx].card;
            state.stack.splice(stackIdx, 1);
            if (card) ActionProcessor.moveCard(state, card, Zone.Exile, card.ownerId, log);
        } else {
            const obj = this.findObject(state, tid, { card: stackObject?.card || stackObject } as any, parentContext);
            if (obj) ActionProcessor.moveCard(state, obj, Zone.Exile, obj.ownerId, log);
        }
    });
  }

   private static handleReturnToHand(state: GameState, targets: string[], log: (m: string) => void, stackObject?: any, parentContext?: any) {
    log(`[RETURN-TO-HAND] Processing targets: ${targets.join(', ')}`);
    targets.forEach(tid => {
        const obj = this.findObject(state, tid, stackObject, parentContext);
        if (obj) {
            log(`[RETURN-TO-HAND] Found object ${obj.definition.name}. Triggering moveCard to owner ${obj.ownerId}.`);
            ActionProcessor.moveCard(state, obj, Zone.Hand, obj.ownerId, log);
            state.turnState.permanentReturnedToHandThisTurn = true;
        }
    });
  }

  private static handlePhasedOut(state: GameState, targets: string[], value: boolean, log: (m: string) => void, stackObject?: any, parentContext?: any) {
    targets.forEach(tid => {
        const obj = this.findObject(state, tid, stackObject, parentContext);
        if (obj) {
            obj.isPhasedOut = value;
            if (state.combat) {
                state.combat.attackers = state.combat.attackers.filter(a => a.attackerId !== tid);
                state.combat.blockers = state.combat.blockers.filter(b => b.blockerId !== tid);
            }
            log(`${obj.definition.name} phased ${value ? 'out' : 'in'}.`);
        }
    });
  }

  private static handleDestroy(state: GameState, targets: string[], log: (m: string) => void, stackObject?: any, parentContext?: any) {
    targets.forEach(tid => {
        const obj = this.findObject(state, tid, stackObject, parentContext);
        if (obj) {
            if (LayerProcessor.hasKeyword(obj, state, 'Indestructible')) {
                log(`${obj.definition.name} is indestructible.`);
                return;
            }
            ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.ownerId, log);
        }
    });
  }

  private static handleSacrifice(state: GameState, targets: string[], sourceId: string, log: (m: string) => void) {
    targets.forEach(tid => {
        // Sacrifice can target a player (who must then choose) or a permanent directly
        const player = state.players[tid];
        if (player) {
            // "Each opponent sacrifices a creature" -> trigger a choice for the player
            // This is a special case: we need the player to pick something they own
            const creatures = state.battlefield.filter(o => o.controllerId === tid && o.definition.types.some(t => t.toLowerCase() === 'creature'));
            
            if (creatures.length === 0) {
                log(`${player.name} has no creatures to sacrifice.`);
                return;
            }

            if (creatures.length === 1) {
                TriggerProcessor.onEvent(state, { type: 'ON_SACRIFICE', playerId: tid, sourceId: creatures[0].id, data: { object: creatures[0] } }, log);
                ActionProcessor.moveCard(state, creatures[0], Zone.Graveyard, tid, log);
                log(`${player.name} sacrificed ${creatures[0].definition.name}.`);
                return;
            }

            // Multiple options: trigger a choice
            state.pendingAction = ChoiceGenerator.createCardChoice(state, creatures, {
                label: "Scegli una creatura da sacrificare",
                playerId: tid,
                sourceId: sourceId,
                hideUndo: true,
                optional: false,
                onSelected: (c) => [{ type: 'Sacrifice', targetId: c.id }]
            });
            log(`${player.name} must choose a creature to sacrifice.`);
        } else {
            // Direct sacrifice of a specific object (rare for effects, common for costs)
            const obj = state.battlefield.find(o => o.id === tid);
            if (obj) {
                TriggerProcessor.onEvent(state, { type: 'ON_SACRIFICE', playerId: obj.controllerId, sourceId: obj.id, data: { object: obj } }, log);
                ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.controllerId, log);
                log(`${state.players[obj.controllerId]?.name} sacrificed ${obj.definition.name}.`);
            }
        }
    });
  }

  private static handleFight(state: GameState, targets: string[], log: (m: string) => void) {
      if (targets.length < 2) return;
      const c1 = this.findObject(state, targets[0]);
      const c2 = this.findObject(state, targets[1]);

      if (!c1 || !c2) {
          log(`[FIGHT] One or more combatants are missing from the battlefield. Fight canceled.`);
          return;
      }

      // Rule 701.12: Each deals damage to the other EQUAL TO ITS POWER
      const p1 = LayerProcessor.getEffectiveStats(c1, state).power;
      const p2 = LayerProcessor.getEffectiveStats(c2, state).power;

      log(`[FIGHT] ${c1.definition.name} (${p1}) fights ${c2.definition.name} (${p2}).`);

      this.handleDealDamage(state, [c2.id], p1, c1.id, log);
      this.handleDealDamage(state, [c1.id], p2, c2.id, log);
  }

  private static handleGainLife(state: GameState, targets: string[], amount: number, log: (m: string) => void) {
    targets.forEach(pid => {
        if (state.players[pid]) {
            state.players[pid].life += amount;
            state.turnState.lastLifeGainedAmount = amount;
            log(`${state.players[pid].name} gains ${amount} life.`);
        }
    });
  }

  private static handleLoseLife(state: GameState, targets: string[], amount: number, log: (m: string) => void) {
    targets.forEach(pid => {
        if (state.players[pid]) {
            // Rule 119.3: Loss of life occurs when an effect explicitly says so.
            state.players[pid].life -= amount;
            // Optionally: state.turnState.lastLifeLostAmount = amount; // If needed by other cards
            log(`${state.players[pid].name} loses ${amount} life.`);
        }
    });
  }

  private static handleAddCounters(state: GameState, targets: string[], amount: number, type: string, log: (m: string) => void) {
    targets.forEach(tid => {
        const obj = this.findObject(state, tid);
        if (obj) {
            obj.counters[type] = (obj.counters[type] || 0) + amount;
            log(`Added ${amount} ${type} counter(s) to ${obj.definition.name}.`);
        }
    });
  }

  private static handleCreateToken(state: GameState, targets: string[], amount: number, blueprint: any, log: (m: string) => void, pOverride?: number, tOverride?: number) {
    targets.forEach(pid => {
        if (!blueprint) return;
        for (let i = 0; i < amount; i++) {
            this.createToken(state, blueprint, pid, pOverride, tOverride);
        }
        const pt = pOverride !== undefined ? ` [${pOverride}/${tOverride}]` : "";
        log(`Created ${amount} ${blueprint.name}${pt} token(s) for ${state.players[pid]?.name}.`);
    });
  }


  /**
   * CR 114: Create an Emblem and place it in the Command Zone.
   * Emblems are permanent objects that cannot be removed and have triggered abilities.
   */
  private static handleCreateEmblem(
    state: GameState,
    effect: any,
    controllerId: PlayerId,
    sourceId: GameObjectId,
    log: (m: string) => void
  ) {
    const blueprint = effect.emblemBlueprint;
    if (!blueprint) {
      log(`[ERROR] CreateEmblem: No emblemBlueprint provided.`);
      return;
    }

    const emblemId = `emblem_${controllerId}_${blueprint.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
    const sourceObj = this.findObject(state, sourceId);

    // Rule 114.1: Create the emblem in the Command Zone
    const emblem: EmblemDefinition = {
      id: emblemId,
      name: blueprint.name || 'Emblem',
      controllerId,
      oracleText: blueprint.oracleText || '',
      image_url: sourceObj?.definition.image_url, // Show the PW art
      abilities: blueprint.abilities || []
    };

    // Initialize emblems array if it doesn't exist (backward compat)
    if (!state.emblems) state.emblems = [];
    state.emblems.push(emblem);
    log(`[EMBLEM] ${state.players[controllerId]?.name} gets ${emblem.name} (Command Zone).`);

    // Register each emblem ability into the Rule Registry
    // They use a special sourceId prefix so TriggerProcessor can find them via state.emblems
    blueprint.abilities?.forEach((ability: any, idx: number) => {
      const registeredAbility = {
        ...ability,
        id: `${emblemId}_ability_${idx}`,
        sourceId: emblemId,          // Emblem ID as source
        controllerId,
        activeZone: 'Command',       // Emblems function from the Command Zone
      };

      state.ruleRegistry.triggeredAbilities.push(registeredAbility);
      log(`[EMBLEM] Registered ability: "${ability.triggerEvent || 'static'}" for ${emblem.name}.`);
    });
  }

  /**
   * CR 611: Applying a Continuous Effect from a spell or ability resolution.
   * Registers it into the central rule registry so LayerProcessor can evaluate it.
   */
  private static handleApplyContinuousEffect(
    state: GameState,
    effect: EffectDefinition,
    sourceId: GameObjectId,
    resolvedTargetIds: string[],
    log: (m: string) => void,
    stackObject?: any
  ) {
    // PRIORITY for controllerId:
    // 1. The stackObject itself (most reliable — the actual spell being resolved)
    // 2. The game object found by findObject (may be missing if spell just left the stack)
    // 3. state.activePlayerId (LAST resort — this is wrong on the opponent's turn!)
    const sourceObj = this.findObject(state, sourceId);
    const controllerId = stackObject?.controllerId || sourceObj?.controllerId || state.activePlayerId;
    log(`[CE] Resolving continuous effect. ControllerId=${controllerId} (from: ${stackObject ? 'stackObject' : sourceObj ? 'findObject' : 'activePlayer fallback'})`);
    const durationStr = (effect as any).duration || DurationType.UntilEndOfTurn;
    const durationType = (durationStr === DurationType.UntilEndOfTurn)
        ? DurationType.UntilEndOfTurn
        : DurationType.Static;

    // RULE 611.2a: Continuous effects from spells/abilities SNAP targets at resolution.
    // Static abilities from permanents (like Glorious Anthem) stay dynamic via targetMapping.
    let finalTargetIds = resolvedTargetIds.length > 0 ? [...resolvedTargetIds] : undefined;
    
    // If it's a floating effect (from a spell) and has a dynamic mapping, we convert it to a snapshot of IDs
    const mapping = (effect as any).targetMapping;
    if (!finalTargetIds && mapping) {
        if (mapping === 'ALL_PERMANENTS_YOU_CONTROL') {
            finalTargetIds = state.battlefield.filter(o => o.controllerId === controllerId).map(o => o.id);
        } else if (mapping === 'ALL_CREATURES_YOU_CONTROL') {
            finalTargetIds = state.battlefield.filter(o => 
                o.controllerId === controllerId && 
                o.definition.types.some(t => t.toLowerCase() === 'creature')
            ).map(o => o.id);
        }
    }

    const effId = `floating_${sourceId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const continuousEff: any = {
        id: effId,
        sourceId: 'floating', // Floating: not tied to a permanent's presence on battlefield
        controllerId,
        layer: (effect as any).layer || 7,
        timestamp: Date.now(),
        activeZones: ['Battlefield'],
        duration: { type: durationType },
        targetMapping: finalTargetIds ? undefined : mapping, // If we have IDs, we don't need mapping
        targetIds: finalTargetIds,
        abilitiesToAdd: (effect as any).abilitiesToAdd,
        abilitiesToRemove: (effect as any).abilitiesToRemove,
        powerModifier: (effect as any).powerModifier,
        toughnessModifier: (effect as any).toughnessModifier,
    };

    state.ruleRegistry.continuousEffects.push(continuousEff);
    const keywords = (effect as any).abilitiesToAdd?.join(', ') || '';
    const mods = [];
    if ((effect as any).powerModifier) mods.push(`+${(effect as any).powerModifier}/+${(effect as any).toughnessModifier}`);
    if (keywords) mods.push(keywords);
    log(`Applied continuous effect [${durationStr}]: ${mods.join(', ')} to ${resolvedTargetIds.length} target(s).`);
  }

  /* --- Helper Methods --- */

  private static resolveAmount(
    state: GameState, 
    amount: number | string | undefined, 
    sourceId: GameObjectId, 
    controllerId: PlayerId,
    stackObject?: any
  ): number {
    if (amount === undefined) return 0;
    if (typeof amount === 'number') {
      return amount === -1 ? state.turnState.lastDamageAmount || 0 : amount;
    }

    switch (amount) {
      case 'POWER': {
        const obj = this.findObject(state, sourceId, stackObject);
        return obj?.effectiveStats?.power || parseInt(obj?.definition.power || '0') || 0;
      }
      case 'TOUGHNESS': {
        const obj = this.findObject(state, sourceId, stackObject);
        return obj?.effectiveStats?.toughness || parseInt(obj?.definition.toughness || '0') || 0;
      }
      case 'TARGET_1_CMC': {
        const tid = (stackObject as any)?.targets?.[0];
        if (!tid) return 0;
        const obj = this.findObject(state, tid as string, stackObject);
        return obj ? ManaProcessor.getManaValue(obj.definition.manaCost || '') : 0;
      }
      case 'TARGET_1_HALF_LIFE_UP':
      case 'HALF_LIFE_ROUND_UP': {
          const tid = (stackObject as any)?.targets?.[0];
          const player = state.players[tid as string];
          return player ? Math.ceil(player.life / 2) : 0;
      }
      case 'TARGET_1_HALF_LIBRARY_UP':
      case 'HALF_LIBRARY_ROUND_UP': {
          const tid = (stackObject as any)?.targets?.[0];
          const player = state.players[tid as string];
          return player ? Math.ceil(player.library.length / 2) : 0;
      }
      case 'SHRINE_COUNT':
        return state.battlefield.filter(o => o.controllerId === controllerId && o.definition.subtypes.includes('Shrine')).length;
      case (typeof amount === 'string' && (amount as string).startsWith('COUNT_')) ? amount : '___NON_MATCHING___': {
          const filter = (amount as string).split('_')[1];
          return state.battlefield.filter(o => 
            o.controllerId === controllerId && 
            (o.definition.types.some(t => t.toLowerCase() === filter.toLowerCase()) || o.definition.subtypes.some(t => t.toLowerCase() === filter.toLowerCase()))
          ).length;
      }
      case '2_PER_FLYING_CREATURE_YOU_CONTROL':
        const flyingCount = state.battlefield.filter(o => o.controllerId === controllerId && (o.effectiveStats?.keywords.includes('Flying') || o.definition.keywords.includes('Flying'))).length;
        return 2 * flyingCount;
      case 'INSTANT_SORCERY_IN_GRAVEYARD_COUNT':
        const p = state.players[controllerId];
        return p ? p.graveyard.filter(o => o.definition.types.includes('Instant') || o.definition.types.includes('Sorcery')).length : 0;
      case 'DAMAGE_DEALT_AMOUNT':
      case 'EVENT_AMOUNT':
          return (stackObject?.data?.eventAmount) !== undefined ? stackObject.data.eventAmount : (state.turnState.lastDamageAmount || 0);
      case 'LIFE_GAINED_AMOUNT':
          return state.turnState.lastLifeGainedAmount || 0;
      case 'X': {
        return stackObject?.xValue || 0;
      }
      default:
        return 0;
    }
  }


  private static getLegalTargetIdsForEffect(state: GameState, sourceId: string, targetDef: any, stackObject?: any): string[] {
      // Potential pool of targets:
      const pool = [
          ...Object.keys(state.players),
          ...state.battlefield.map(o => o.id),
          ...Object.values(state.players).flatMap(p => p.graveyard.map(c => c.id))
      ];
      return pool.filter(tid => ValidationProcessor.isLegalTarget(state, stackObject || sourceId, tid, targetDef));
  }

  private static resolveTargetMapping(
    state: GameState, 
    mapping: string, 
    targets: string[], 
    sourceId: GameObjectId,
    controllerId: PlayerId,
    stackData?: any,
    effect?: EffectDefinition
  ): string[] {
    const eventData = stackData?.eventData;
    switch (mapping) {
      case 'SELF': return [sourceId];
      case 'CONTROLLER': return [controllerId];
      case 'TARGET_1': return [targets[0]];
      case 'SELF_AND_TARGET_1': return [sourceId, targets[0]];
      case 'TARGET_2': return [targets[1]];
      case 'TARGET_ALL': return targets;
      case 'MATCHING_PERMANENTS_YOU_CONTROL':
          if (!effect?.restrictions) return [];
          return state.battlefield
            .filter(o => o.controllerId === controllerId && ValidationProcessor.matchesRestrictions(state, o, effect.restrictions as any, controllerId, sourceId))
            .map(o => o.id);
      case 'MATCHING_PERMANENTS':
          if (!effect?.restrictions) return [];
          return state.battlefield
            .filter(o => ValidationProcessor.matchesRestrictions(state, o, effect.restrictions as any, controllerId, sourceId))
            .map(o => o.id);
      case 'TRIGGER_SOURCE':
          return eventData?.sourceId ? [eventData.sourceId] : (stackData?.sourceId ? [stackData.sourceId] : []);
      case 'TRIGGER_TARGET':
          return eventData?.targetId ? [eventData.targetId] : (stackData?.targetId ? [stackData.targetId] : []);
      case 'EVENT_TARGET':
          return eventData?.object?.id ? [eventData.object.id] : (eventData?.targetId ? [eventData.targetId] : []);
      case 'TARGET_1_CONTROLLER':
        const obj = this.findObject(state, targets[0]);
        return obj ? [obj.controllerId] : [];
      case 'ALL_CREATURES_YOU_CONTROL':
        return state.battlefield
          .filter(o => o.controllerId === controllerId && o.definition.types.some(t => t.toLowerCase() === 'creature'))
          .map(o => o.id);
      case 'ALL_PERMANENTS_YOU_CONTROL':
        return state.battlefield
          .filter(o => o.controllerId === controllerId)
          .map(o => o.id);
      case 'ALL_CREATURES':
        return state.battlefield
          .filter(o => o.definition.types.some(t => t.toLowerCase() === 'creature'))
          .map(o => o.id);
      case 'EACH_OPPONENT':
          return Object.keys(state.players).filter(pid => pid !== controllerId);
      case 'EACH_PLAYER':
          return Object.keys(state.players);
      case 'SELECTED_CARD':
          return [targets[0]]; // We treat the choice value as the first target
      case 'TARGET_OPPONENT': {
          const opponentId = Object.keys(state.players).find(pid => pid !== controllerId);
          return opponentId ? [opponentId] : [];
      }
      case 'ANY_TARGET':
          return targets;
      default:
          return [];
    }
  }

  private static findObject(state: GameState, id: string, stackObject?: any, parentContext?: any): GameObject | undefined {
    // 1. Battlefield
    const foundOnField = state.battlefield.find(o => o.id === id);
    if (foundOnField) return foundOnField;

    // 2. The physical card for the spell CURRENTLY resolving (even if it was popped from stack)
    if (stackObject) {
       const card = stackObject.card || stackObject;
       if (card && card.id === id) return card;
    }

    // 3. Stack
    const foundOnStack = state.stack.find(s => s.id === id || s.sourceId === id)?.card;
    if (foundOnStack) return foundOnStack;

    // 4. Graveyard
    const foundInGY = Object.values(state.players).flatMap(p => p.graveyard).find(o => o.id === id);
    if (foundInGY) return foundInGY;

    // 5. Exile
    const foundInExile = state.exile.find(o => o.id === id);
    if (foundInExile) return foundInExile;

    // 6. Hands (e.g. Duress selection)
    for (const playerId in state.players) {
        const foundInHand = state.players[playerId as PlayerId].hand.find(o => o.id === id);
        if (foundInHand) return foundInHand;
    }

    // 6. Temporary "Looking" Zone (for LookAtTop effects mid-choice)
    if (state.pendingAction?.data?.lookingCards) {
        const foundInLooking = (state.pendingAction.data.lookingCards as GameObject[]).find(o => o.id === id);
        if (foundInLooking) return foundInLooking;
    }
    
    // 7. Check parent context (in case pendingAction was cleared but resolveEffects is still running)
    if (parentContext?.lookingCards) {
        const foundInLooking = (parentContext.lookingCards as GameObject[]).find(o => o.id === id);
        if (foundInLooking) return foundInLooking;
    }

    return undefined;
  }

  private static createToken(state: GameState, blueprint: any, controllerId: PlayerId, pOverride?: number, tOverride?: number) {
    const token: GameObject = {
      id: `token_${Math.random().toString(36).substr(2, 9)}`,
      ownerId: controllerId,
      controllerId: controllerId,
      definition: {
        name: blueprint.name,
        manaCost: "", // Tokens have no mana cost (CR 111.12)
        // Map colors strictly from the blueprint (e.g., ["Blue", "Red"] -> ["blue", "red"])
        colors: (blueprint.colors || []).map((c: string) => {
            const map: Record<string, string> = { 'W': 'white', 'U': 'blue', 'B': 'black', 'R': 'red', 'G': 'green' };
            const result = map[c.toUpperCase()] || c.toLowerCase();
            return ['white', 'blue', 'black', 'red', 'green'].includes(result) ? result : null;
        }).filter(Boolean) as any[],
        supertypes: blueprint.supertypes || [],
        types: [...(blueprint.types || []), "Token"],
        subtypes: blueprint.subtypes || [],
        power: pOverride !== undefined ? pOverride.toString() : (blueprint.power || "0"),
        toughness: tOverride !== undefined ? tOverride.toString() : (blueprint.toughness || "0"),
        keywords: blueprint.keywords || [],
        oracleText: blueprint.oracleText || "",
        image_url: blueprint.image_url || ""
      },
      zone: Zone.Battlefield,
      isTapped: false,
      damageMarked: 0,
      deathtouchMarked: false,
      summoningSickness: true,
      abilitiesUsedThisTurn: 0,
      faceDown: false,
      keywords: [],
      counters: {}
    };
    (token as any).isToken = true;
    state.battlefield.push(token);
  }
}
