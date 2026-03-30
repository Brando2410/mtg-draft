import { GameState, GameObjectId, PlayerId, GameObject, Zone } from '@shared/engine_types';
import { TriggerProcessor } from '../effects/TriggerProcessor';
import { ValidationProcessor } from '../state/ValidationProcessor';

/**
 * Rules Engine Module: Damage Handling (Rule 120)
 * Centralizes all damage application to ensure consistent event emission.
 */
export class DamageProcessor {

  /**
   * Applies damage to a creature or player.
   * Rule 120.3: Damage dealt to a creature results in that much damage being marked on it.
   * Rule 120.3a: Damage dealt to a player results in that player losing that much life.
   */
  public static dealDamage(
    state: GameState, 
    sourceId: GameObjectId, 
    targetId: GameObjectId | PlayerId, 
    amount: number, 
    isCombat: boolean,
    log: (msg: string) => void
  ) {
    if (amount <= 0) return;

    // Rule 702.16e: Protection prevents damage
    if (ValidationProcessor.shouldPreventDamage(state, sourceId, targetId)) {
        log(`Damage to ${targetId} prevented by Protection.`);
        return;
    }

    // 1. Check for Creature/Planeswalker Target
    const battlefieldObj = state.battlefield.find(o => o.id === targetId);
    if (battlefieldObj) {
      if (battlefieldObj.definition.types.includes('Planeswalker')) {
        // Rule 120.3c: Damage to planeswalker removes loyalty counters
        const currentLoyalty = battlefieldObj.counters.loyalty || 0;
        battlefieldObj.counters.loyalty = Math.max(0, currentLoyalty - amount);
        log(`${battlefieldObj.definition.name} loses ${amount} loyalty (Current: ${battlefieldObj.counters.loyalty}).`);
      } else {
        // Rule 120.3: Damage to creature marks damage
        battlefieldObj.damageMarked += amount;
        log(`${battlefieldObj.definition.name} takes ${amount} damage (Total: ${battlefieldObj.damageMarked}).`);

        // Rule 702.2: Deathtouch (Any nonzero amount of damage is lethal)
        const sourceObj = state.battlefield.find(o => o.id === sourceId) || 
                          state.stack.find(s => s.id === sourceId)?.card;
        if (sourceObj) {
            const { LayerProcessor } = require('../state/LayerProcessor');
            const sourceStats = LayerProcessor.getEffectiveStats(sourceObj, state);
            if (sourceStats.keywords.includes('Deathtouch') && amount > 0) {
                battlefieldObj.deathtouchMarked = true;
                log(`[DEATHTOUCH] ${battlefieldObj.definition.name} is marked for destruction.`);
            }
        }
      }
      
      state.turnState.lastDamageAmount = amount;
      
      // Emit trigger event
      TriggerProcessor.onEvent(state, {
        type: 'ON_DAMAGE_TAKED',
        targetId: targetId,
        sourceId: sourceId,
        amount: amount,
        data: { isCombat, object: battlefieldObj }
      }, log);
    } else {
      // 2. Check for Player Target
      const targetPlayer = state.players[targetId];
      if (targetPlayer) {
        const oldLife = targetPlayer.life;
        targetPlayer.life -= amount;
        state.turnState.lastDamageAmount = amount;
        log(`Player ${targetId} takes ${amount} damage (${oldLife} -> ${targetPlayer.life}).`);

        // M21 State Tracking: Non-combat damage to opponents
        const sourceObj = state.battlefield.find(o => o.id === sourceId) || 
                          state.stack.find(s => s.id === sourceId)?.card;
        
        const sourceControllerId = sourceObj?.controllerId || state.activePlayerId;

        if (!isCombat && sourceControllerId !== targetId) {
          state.turnState.noncombatDamageDealtToOpponents += amount;
          
          // Trigger for Chandra's Incinerator
          TriggerProcessor.onEvent(state, {
              type: 'ON_NONCOMBAT_DAMAGE_OPPONENT',
              targetId: targetId,
              sourceId: sourceId,
              amount: amount
          }, log);
        }

        // Emit general player damage event
        TriggerProcessor.onEvent(state, {
          type: 'ON_DAMAGE_PLAYER',
          targetId: targetId,
          sourceId: sourceId,
          amount: amount,
          data: { isCombat }
        }, log);
      }
    }

    // NEW: Handle Lifelink (Rule 702.15)
    // Damage dealt by a source with lifelink also causes that source’s controller to gain that much life.
    const sourceObj = state.battlefield.find(o => o.id === sourceId) || 
                      state.stack.find(s => s.id === sourceId)?.card;
    
    if (sourceObj) {
        const { LayerProcessor } = require('../state/LayerProcessor');
        const stats = LayerProcessor.getEffectiveStats(sourceObj, state);
        if (stats.keywords.includes('Lifelink')) {
            const controllerId = sourceObj.controllerId;
            const player = state.players[controllerId];
            if (player) {
                const oldLife = player.life;
                player.life += amount;
                log(`${player.name} gains ${amount} life from Lifelink (${oldLife} -> ${player.life}).`);
                
                // Fire life gain event
                TriggerProcessor.onEvent(state, {
                    type: 'ON_LIFE_GAIN',
                    playerId: controllerId,
                    amount: amount,
                    data: { sourceId: sourceObj.id }
                }, log);
            }
        }
    }
  }
}
