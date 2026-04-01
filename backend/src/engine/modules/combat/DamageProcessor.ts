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
        log(`[MISS] Damage to ${targetId} prevented by Protection.`);
        return;
    }

    // Rule 615: Prevention Effects
    if (this.shouldPreventDamage(state, targetId, isCombat)) {
        log(`[PREVENTED] Damage to ${targetId} was prevented by an effect.`);
        return;
    }

    const { LayerProcessor } = require('../state/LayerProcessor');
    const sourceObj = state.battlefield.find(o => o.id === sourceId) || 
                      state.stack.find(s => s.id === sourceId)?.card;
    const sourceStats = sourceObj ? LayerProcessor.getEffectiveStats(sourceObj, state) : null;

    // 1. Resolve Damage to Permanents (Battlefield)
    const battlefieldObj = state.battlefield.find(o => o.id === targetId);
    if (battlefieldObj) {
        this.applyDamageToPermanent(state, sourceObj, sourceStats, battlefieldObj, amount, isCombat, log);
        state.turnState.lastDamageAmount = amount;
    } else {
        // 2. Resolve Damage to Players
        const targetPlayer = state.players[targetId];
        if (targetPlayer) {
            this.applyDamageToPlayer(state, sourceObj, targetPlayer, amount, isCombat, log);
            state.turnState.lastDamageAmount = amount;
        }
    }

    // 3. Handle Lifelink (Rule 702.15)
    if (sourceObj && sourceStats?.keywords.includes('Lifelink')) {
        const controllerId = sourceObj.controllerId;
        const player = state.players[controllerId];
        if (player) {
            player.life += amount;
            log(`[LIFELINK] ${player.name} gains ${amount} life (Total: ${player.life}).`);
            TriggerProcessor.onEvent(state, { type: 'ON_LIFE_GAIN', playerId: controllerId, amount, data: { sourceId: sourceObj.id } }, log);
        }
    }
  }

  private static applyDamageToPermanent(state: GameState, sourceObj: any, sourceStats: any, target: GameObject, amount: number, isCombat: boolean, log: (m: string) => void) {
    const types = target.definition.types.map(t => t.toLowerCase());

    if (types.includes('planeswalker')) {
      // Rule 120.3c: Damage to planeswalker removes loyalty
      const currentLoyalty = target.counters['loyalty'] || 0;
      target.counters['loyalty'] = Math.max(0, currentLoyalty - amount);
      log(`[DAMAGE] ${target.definition.name} loses ${amount} loyalty.`);
    } else {
      // Rule 120.3: Damage to creature marks damage
      target.damageMarked += amount;
      log(`[DAMAGE] ${target.definition.name} takes ${amount} damage (Total: ${target.damageMarked}).`);

      // Rule 702.2: Deathtouch
      if (sourceStats?.keywords.includes('Deathtouch')) {
          target.deathtouchMarked = true;
          log(`[DEATHTOUCH] ${target.definition.name} is marked by lethal poison.`);
      }
    }

    TriggerProcessor.onEvent(state, { type: 'ON_DAMAGE_TAKED', targetId: target.id, sourceId: sourceObj?.id, amount, data: { isCombat } }, log);
  }

  private static applyDamageToPlayer(state: GameState, sourceObj: any, player: any, amount: number, isCombat: boolean, log: (m: string) => void) {
    player.life -= amount;
    log(`[DAMAGE] Player ${player.name} takes ${amount} damage (Life: ${player.life}).`);

    // Rule 120.3a: Damage dealt to opponent results in loss of life
    const sourceControllerId = sourceObj?.controllerId || state.activePlayerId;
    if (!isCombat && sourceControllerId !== player.id) {
      state.turnState.noncombatDamageDealtToOpponents += amount;
      TriggerProcessor.onEvent(state, { type: 'ON_NONCOMBAT_DAMAGE_OPPONENT', targetId: player.id, sourceId: sourceObj?.id, amount }, log);
    }

    TriggerProcessor.onEvent(state, { type: 'ON_DAMAGE_PLAYER', targetId: player.id, sourceId: sourceObj?.id, amount, data: { isCombat } }, log);
  }

  public static shouldPreventDamage(state: GameState, targetId: string, isCombat: boolean): boolean {
      const effects = state.ruleRegistry.preventionEffects || [];
      if (effects.length === 0) return false;

      // We only care if target is a creature for Dog prevention
      const targetObj = state.battlefield.find(o => o.id === targetId);
      if (!targetObj) return false;

      // Import EffectProcessor dynamically here if needed to avoid cycles
      const { EffectProcessor } = require('./../effects/EffectProcessor');

      for (const eff of effects) {
          if (eff.damageType === 'CombatDamage' && !isCombat) continue;
          
          const validIds = EffectProcessor.resolveTargetMapping(state, eff.targetMapping, [], eff.sourceId, eff.controllerId);
          if (validIds.includes(targetId)) return true;
      }
      return false;
  }
}
