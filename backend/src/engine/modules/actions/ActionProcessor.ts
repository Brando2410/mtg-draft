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
    // 1. CR 400.7: Remove from the current zone
    if (card.zone === Zone.Battlefield) {
      state.battlefield = state.battlefield.filter(c => c.id !== card.id);
    } else if (card.zone === Zone.Stack) {
      state.stack = state.stack.filter(s => s.sourceId !== card.id);
    } else {
      const player = state.players[card.ownerId];
      if (player) {
         if (card.zone === Zone.Hand) player.hand = player.hand.filter(c => c.id !== card.id);
         else if (card.zone === Zone.Graveyard) player.graveyard = player.graveyard.filter(c => c.id !== card.id);
         else if (card.zone === Zone.Library) player.library = player.library.filter(c => c.id !== card.id);
      }
    }

    // 2. CR 400.7: Add to the new zone
    const fromZone = card.zone;
    card.zone = to;

    // Rule 111.7: A token that leaves the battlefield cesses to exist.
    const isToken = (card as any).isToken || card.id.startsWith('token_');

    if (to === Zone.Battlefield) {
      state.battlefield.push(card);
      const isCreature = (card.definition.types || []).some(t => t.toLowerCase() === 'creature');
      card.summoningSickness = isCreature;
      this.registerAbilities(state, card);
      
      TriggerProcessor.onEvent(state, {
          type: 'ON_ETB',
          targetId: card.id,
          sourceId: card.id,
          data: { object: card }
      }, log || (() => {}));

      if (card.definition.types.some(t => t.toLowerCase() === 'planeswalker')) {
          const logic = M21_LOGIC[card.definition.name];
          const startingLoyalty = parseInt((card.definition as any).loyalty || (logic as any)?.loyalty || "0", 10);
          card.counters.loyalty = startingLoyalty;
          if (log) log(`${card.definition.name} enters with ${startingLoyalty} loyalty.`);
      }

    } else if (to === Zone.Exile) {
      if (!isToken) state.exile.push(card);
    } else {
      const player = state.players[ownerId];
      if (player) {
         if (to === Zone.Hand && !isToken) player.hand.push(card);
         else if (to === Zone.Graveyard) {
             if (!isToken) player.graveyard.push(card);
             
             const types = (card.definition.types || []).map(t => t.toLowerCase());
             if (fromZone === Zone.Battlefield && types.includes('creature')) {
                TriggerProcessor.onEvent(state, {
                    type: 'ON_DEATH',
                    targetId: card.id,
                    sourceId: card.id,
                    data: { object: card }
                }, log || (() => {}));
             }
         }
         else if (to === Zone.Library && !isToken) player.library.push(card);
      }
    }
    
    // Rule 400.7: Reset characteristics on zone change (except for cards staying on the battlefield)
    if (to !== Zone.Battlefield) {
       // NEW: Unregister abilities when leaving the Battlefield
       if (fromZone === Zone.Battlefield) {
          this.unregisterAbilities(state, card.id);
       }

       if (card.zone === Zone.Battlefield && to === Zone.Hand) {
          state.turnState.permanentReturnedToHandThisTurn = true;
       }
       card.isTapped = false;
       card.damageMarked = 0;
       const isCreature = card.definition.types.includes('Creature');
       // 302.6: Summoning sickness is refreshed only when entering the battlefield or changing controllers
       card.summoningSickness = isCreature;
    }
  }

  private static registerAbilities(state: GameState, card: GameObject) {
    // 1. Look up card logic
    const name = card.definition.name;
    const logic = M21_LOGIC[name];
    
    if (!logic || !logic.abilities) return;

    // 2. Map abilities into the registry
    logic.abilities.forEach((ability: any, index: number) => {
        const instanceId = `${card.id}_ability_${index}`;
        
        if (ability.type === 'Triggered') {
            state.ruleRegistry.triggeredAbilities.push({
                id: instanceId,
                sourceId: card.id,
                controllerId: card.controllerId,
                eventMatch: ability.triggerEvent || ability.on, // Support both
                condition: ability.triggerCondition || ability.condition,
                oracleText: ability.oracleText || card.definition.oracleText || 'Triggered ability',
                // Pass extra data used by engine later
                ...ability
            } as any);
        } else if (ability.type === 'Activated') {
            state.ruleRegistry.activatedAbilities.push({
                id: instanceId,
                sourceId: card.id,
                controllerId: card.controllerId,
                costs: ability.costs,
                isManaAbility: ability.isManaAbility || false,
                ...ability
            } as any);
        } else if (ability.type === 'Static') {
            // Register all Static 'ApplyContinuousEffect' into continuousEffects
            if (ability.effects) {
                ability.effects.forEach((eff: any, eId: number) => {
                   if (eff.type === 'ApplyContinuousEffect') {
                       // Convert targetMapping to valid targetIds where applicable
                       let targetIds: string[] | undefined = undefined;
                       if (eff.targetMapping === 'SELF') {
                           targetIds = [card.id];
                       }

                       state.ruleRegistry.continuousEffects.push({
                           id: `${instanceId}_eff_${eId}`,
                           sourceId: card.id,
                           controllerId: card.controllerId,
                           layer: eff.layer || 7,
                           timestamp: state.turnNumber * 1000 + Date.now() % 1000, // simple heuristic
                           activeZones: [Zone.Battlefield],
                           duration: { type: 'Static' as any },
                           targetIds,
                           targetMapping: eff.targetMapping, // Used by LayerProcessor if targetIds is undefined
                           powerModifier: eff.powerModifier,
                           toughnessModifier: eff.toughnessModifier,
                           abilitiesToAdd: eff.abilitiesToAdd,
                           abilitiesToRemove: eff.abilitiesToRemove
                       } as any);
                   } else if (eff.type === 'CombatConstraint') {
                       // Track combat constraints in restrictions
                       state.ruleRegistry.restrictions.push({
                           id: `${instanceId}_eff_${eId}`,
                           sourceId: card.id,
                           type: eff.value as any, // e.g., CANNOT_ATTACK
                           duration: { type: 'Static' as any },
                           condition: eff.condition,
                           targetMapping: eff.targetMapping,
                           targetIds: eff.targetMapping === 'SELF' ? [card.id] : undefined
                       } as any);
                   }
                });
            }
        } else if (ability.type === 'Replacement') {
            // Register replacement effects for the ruleRegistry to intersect
            if (!state.ruleRegistry.replacementEffects) state.ruleRegistry.replacementEffects = [];
            state.ruleRegistry.replacementEffects.push({
                id: instanceId,
                sourceId: card.id,
                controllerId: card.controllerId,
                replaceEvent: ability.replaceEvent,
                condition: ability.condition,
                effects: ability.effects,
                ...ability
            } as any);
        }
    });
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
