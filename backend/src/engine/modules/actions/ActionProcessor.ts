import { GameState, PlayerId, GameObject, Zone } from '@shared/engine_types';
import { TriggerProcessor } from '../effects/TriggerProcessor';
import { M21_LOGIC } from '../../data/m21_logic';

/**
 * Physical Actions Handling (Rule 400/103)
 */
export class ActionProcessor {

  /**
   * CR 400.1 / 400.7: An object that moves from one zone to another 
   * becomes a new object with no memory of or relation to its previous existence.
   */
  public static moveCard(state: GameState, card: GameObject, to: Zone, ownerId: PlayerId, log?: (m: string) => void) {
    const fromZone = card.zone;
    
    // 1. Rule 400.7: Remove from the current zone
    this.removeFromCurrentZone(state, card);

    // CR 121: Drawing a card
    if (fromZone === Zone.Library && to === Zone.Hand) {
        TriggerProcessor.onEvent(state, { type: 'ON_DRAW', playerId: ownerId, data: { card } }, log || (() => {}));
    }

    // CR 603.10: "Leaves-the-battlefield" events MUST look back in time.
    // Trigger them while we still have the Battlefield state (counters, registered abilities).
    if (fromZone === Zone.Battlefield && to !== Zone.Battlefield) {
        this.handleLeavingBattlefield(state, card, to, log);
    }

    // 2. Rule 400.7: Reset characteristics and update zone
    card.zone = to;
    const isToken = (card as any).isToken || card.id.startsWith('token_');

    // Rule 400.7: Objects leaving the battlefield lose memory of their state
    if (to !== Zone.Battlefield) {
        this.resetObjectState(state, card, fromZone, to);
    }

    // 3. Rule 400.1: Add to the new zone
    this.addToTargetZone(state, card, to, ownerId, isToken, fromZone, log);
  }

  private static handleLeavingBattlefield(state: GameState, card: GameObject, to: Zone, log?: (m: string) => void) {
      const types = card.definition.types.map(t => t.toLowerCase());
      
      // Rule 603.10a: "Dies" triggers (specifically for creatures moving to graveyard)
      if (to === Zone.Graveyard && types.includes('creature')) {
          TriggerProcessor.onEvent(state, { type: 'ON_DEATH', targetId: card.id, sourceId: card.id, data: { object: card } }, log || (() => {}));
      }

      // General Leave trigger
      TriggerProcessor.onEvent(state, { type: 'ON_LEAVE_BATTLEFIELD', targetId: card.id, sourceId: card.id, data: { object: card, toZone: to } }, log || (() => {}));
  }

  private static removeFromCurrentZone(state: GameState, card: GameObject) {
    if (card.zone === Zone.Battlefield) {
      state.battlefield = state.battlefield.filter(c => c.id !== card.id);
    } else if (card.zone === Zone.Stack) {
      state.stack = state.stack.filter(s => s.id !== card.id && s.sourceId !== card.id);
    } else {
      const player = state.players[card.ownerId];
      if (player) {
         if (card.zone === Zone.Hand) player.hand = player.hand.filter(c => c.id !== card.id);
         else if (card.zone === Zone.Graveyard) player.graveyard = player.graveyard.filter(c => c.id !== card.id);
         else if (card.zone === Zone.Library) player.library = player.library.filter(c => c.id !== card.id);
         else if (card.zone === Zone.Exile) state.exile = state.exile.filter(c => c.id !== card.id);
      }
    }
  }

  private static addToTargetZone(state: GameState, card: GameObject, to: Zone, ownerId: PlayerId, isToken: boolean, from: Zone, log?: (m: string) => void) {
    if (to === Zone.Battlefield) {
      state.battlefield.push(card);
      const isCreature = card.definition.types.some(t => t.toLowerCase() === 'creature');
      card.summoningSickness = isCreature;
      this.registerAbilities(state, card);
      
      this.handleEnteringBattlefield(state, card, log);

    } else if (to === Zone.Exile) {
      if (!isToken) state.exile.push(card);
    } else {
      const player = state.players[ownerId];
      if (!player) return;

      if (to === Zone.Hand && !isToken) player.hand.push(card);
      else if (to === Zone.Library && !isToken) player.library.push(card);
      else if (to === Zone.Graveyard) {
          if (!isToken) player.graveyard.push(card);
          this.handleEnteringGraveyard(state, card, from, log);
      }
    }
  }

  private static resetObjectState(state: GameState, card: GameObject, from: Zone, to: Zone) {
    if (from === Zone.Battlefield) {
        this.unregisterAbilities(state, card.id);
        if (to === Zone.Hand) state.turnState.permanentReturnedToHandThisTurn = true;
    }
    card.isTapped = false;
    card.damageMarked = 0;
    card.deathtouchMarked = false;
    card.counters = {};
  }

  private static handleEnteringBattlefield(state: GameState, card: GameObject, log?: (m: string) => void) {
    // Rule 603.6a: Enters-the-battlefield triggers
    TriggerProcessor.onEvent(state, { type: 'ON_ETB', targetId: card.id, sourceId: card.id, data: { object: card } }, log || (() => {}));

    // Rule 306.5b: Planeswalkers enter with loyalty counters
    if (card.definition.types.some(t => t.toLowerCase() === 'planeswalker')) {
        const logic = M21_LOGIC[card.definition.name];
        const startingLoyalty = parseInt((card.definition as any).loyalty || (logic as any)?.loyalty || "0", 10);
        card.counters['loyalty'] = startingLoyalty;
        if (log) log(`[ETB] ${card.definition.name} enters with ${startingLoyalty} loyalty.`);
    }
  }

  private static handleEnteringGraveyard(state: GameState, card: GameObject, from: Zone, log?: (m: string) => void) {
      // Logic for entering graveyard (not used for dies triggers anymore)
  }

  /* --- Ability Management (Rule 113) --- */

  private static registerAbilities(state: GameState, card: GameObject) {
    const logic = M21_LOGIC[card.definition.name];
    if (!logic || !logic.abilities) return;

    logic.abilities.forEach((ability: any, index: number) => {
        const instanceId = `${card.id}_ability_${index}`;
        switch (ability.type) {
            case 'Triggered': this.registerTriggeredAbility(state, card, ability, instanceId); break;
            case 'Activated': this.registerActivatedAbility(state, card, ability, instanceId); break;
            case 'Static':    this.registerStaticAbility(state, card, ability, instanceId); break;
            case 'Replacement': this.registerReplacementAbility(state, card, ability, instanceId); break;
        }
    });
  }

  private static registerTriggeredAbility(state: GameState, card: GameObject, ability: any, id: string) {
    state.ruleRegistry.triggeredAbilities.push({
        id,
        sourceId: card.id,
        controllerId: card.controllerId,
        eventMatch: ability.triggerEvent || ability.on,
        condition: ability.triggerCondition || ability.condition,
        oracleText: ability.oracleText || card.definition.oracleText || 'Triggered ability',
        ...ability
    } as any);
  }

  private static registerActivatedAbility(state: GameState, card: GameObject, ability: any, id: string) {
    state.ruleRegistry.activatedAbilities.push({
        id,
        sourceId: card.id,
        controllerId: card.controllerId,
        costs: ability.costs,
        isManaAbility: ability.isManaAbility || false,
        ...ability
    } as any);
  }

  private static registerStaticAbility(state: GameState, card: GameObject, ability: any, id: string) {
    if (!ability.effects) return;
    ability.effects.forEach((eff: any, eId: number) => {
        const effId = `${id}_eff_${eId}`;
        if (eff.type === 'ApplyContinuousEffect') {
            state.ruleRegistry.continuousEffects.push({
                id: effId,
                sourceId: card.id,
                controllerId: card.controllerId,
                layer: eff.layer || 7,
                timestamp: Date.now(),
                activeZones: [ability.activeZone || Zone.Battlefield],
                duration: { type: 'Static' as any },
                targetMapping: eff.targetMapping,
                targetIds: eff.targetMapping === 'SELF' ? [card.id] : undefined,
                ...eff
            } as any);
        } else if (eff.type === 'CombatConstraint') {
            state.ruleRegistry.restrictions.push({
                id: effId,
                sourceId: card.id,
                type: eff.value as any,
                duration: { type: 'Static' as any },
                ...eff
            } as any);
        } else if (['SpellTax', 'CostReduction', 'AdditionalCost'].includes(eff.type)) {
             state.ruleRegistry.continuousEffects.push({
                id: effId,
                sourceId: card.id,
                controllerId: card.controllerId,
                layer: 8, // Costs are determined after layers 1-7
                timestamp: Date.now(),
                activeZones: [ability.activeZone || Zone.Battlefield],
                duration: { type: 'Static' as any },
                ...eff
            } as any);
        }
    });
  }

  private static registerReplacementAbility(state: GameState, card: GameObject, ability: any, id: string) {
    if (!state.ruleRegistry.replacementEffects) state.ruleRegistry.replacementEffects = [];
    state.ruleRegistry.replacementEffects.push({ id, sourceId: card.id, ...ability } as any);
  }


  private static unregisterAbilities(state: GameState, cardId: string) {
    state.ruleRegistry.triggeredAbilities = state.ruleRegistry.triggeredAbilities.filter(t => t.sourceId !== cardId);
    state.ruleRegistry.activatedAbilities = state.ruleRegistry.activatedAbilities.filter(a => a.sourceId !== cardId);
    state.ruleRegistry.continuousEffects = state.ruleRegistry.continuousEffects.filter(c => c.sourceId !== cardId);
    state.ruleRegistry.restrictions = state.ruleRegistry.restrictions.filter(r => r.sourceId !== cardId);
    if (state.ruleRegistry.replacementEffects) {
        state.ruleRegistry.replacementEffects = state.ruleRegistry.replacementEffects.filter((r: any) => r.sourceId !== cardId);
    }
  }

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
        if (obj.isTapped) {
            obj.isTapped = false;
            count++;
        }
        // CR 302.6: Summoning sickness wears off at the beginning of the controller's turn
        obj.summoningSickness = false;
      }
    });
  }
}
