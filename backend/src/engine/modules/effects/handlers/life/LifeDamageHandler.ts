import { DamageEffect, EffectDefinition, EffectType, GameState, LifeEffect, ResolutionContext } from '@shared/engine_types';
import { DamageProcessor } from "../../../combat/DamageProcessor";
import { TriggerProcessor } from "../../triggers/TriggerProcessor";
import { RestrictionValidator } from '../../../core/RestrictionValidator';

/**
 * Strategy for CR 119: Damage and CR 120: Life
 */
export class LifeDamageHandler {

  public static handleDamage(state: GameState, effect: EffectDefinition, log: (m: string) => void, context: ResolutionContext) {
    const { EffectProcessor } = require('../EffectProcessor');
    const { TargetingProcessor } = require("../../../actions/TargetingProcessor");
    const { targets, sourceId } = context;
    const damageEff = effect as DamageEffect;
    
    targets.forEach(tid => {
        const sourceMappingIds = damageEff.damageSourceMapping ? TargetingProcessor.resolveTargetMapping(state, damageEff.damageSourceMapping, context, effect) : [];
        const usedSourceId = sourceMappingIds[0] || (damageEff as any).damageSourceId || sourceId;
        const amt = EffectProcessor.resolveAmount(state, damageEff.amount, context, [tid]);
        DamageProcessor.dealDamage(state, usedSourceId, tid, amt, false, log);
    });
  }

  public static handleGainLife(state: GameState, effect: EffectDefinition, log: (m: string) => void, context: ResolutionContext) {
    const { EffectProcessor } = require('../EffectProcessor');
    const { targets } = context;
    const lifeEff = effect as LifeEffect;

    targets.forEach(pid => {
        if (state.players[pid]) {
            if (!RestrictionValidator.canGainLife(state, pid)) {
                log(`${state.players[pid].name} cannot gain life due to a restriction.`);
                return;
            }
            const amount = EffectProcessor.resolveAmount(state, lifeEff.amount, context, [pid]);
            const oldLife = state.players[pid].life;
            state.players[pid].life += amount;
            state.turnState.lastLifeGainedAmount = amount;
            state.turnState.lifeGainedThisTurn[pid] = (state.turnState.lifeGainedThisTurn[pid] || 0) + amount;
            log(`${state.players[pid].name} gains ${amount} life (${oldLife} -> ${state.players[pid].life})`);

            TriggerProcessor.onEvent(state, {
                type: 'ON_LIFE_GAIN',
                playerId: pid,
                amount,
                data: { amount }
            }, log);
        }
    });
  }

  public static handleLoseLife(state: GameState, effect: EffectDefinition, log: (m: string) => void, context: ResolutionContext) {
    const { EffectProcessor } = require('../EffectProcessor');
    const { targets } = context;
    const lifeEff = effect as LifeEffect;

    targets.forEach(pid => {
        if (state.players[pid]) {
            const amount = EffectProcessor.resolveAmount(state, lifeEff.amount, context, [pid]);
            state.players[pid].life -= amount;
            TriggerProcessor.onEvent(state, { type: 'ON_LIFE_LOSS', playerId: pid, amount }, log);
            log(`${state.players[pid].name} loses ${amount} life.`);
        }
    });
  }
}



