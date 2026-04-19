import { GameState, ResolutionContext } from '@shared/engine_types';
import { DamageProcessor } from '../../combat/DamageProcessor';
import { TriggerProcessor } from '../TriggerProcessor';

/**
 * Strategy for CR 119: Damage and CR 120: Life
 */
export class LifeDamageHandler {

  public static handleDamage(state: GameState, effect: any, log: (m: string) => void, context: ResolutionContext) {
    const { EffectProcessor } = require('../EffectProcessor');
    const { TargetingProcessor } = require('../../actions/TargetingProcessor');
    const { targets, sourceId } = context;
    
    targets.forEach(tid => {
        const sourceMappingIds = effect.damageSourceMapping ? TargetingProcessor.resolveTargetMapping(state, effect.damageSourceMapping, context, effect) : [];
        const usedSourceId = sourceMappingIds[0] || effect.damageSourceId || sourceId;
        const amt = EffectProcessor.resolveAmount(state, effect.amount, context, [tid]);
        DamageProcessor.dealDamage(state, usedSourceId, tid, amt, false, log);
    });
  }

  public static handleGainLife(state: GameState, effect: any, log: (m: string) => void, context: ResolutionContext) {
    const { EffectProcessor } = require('../EffectProcessor');
    const { targets } = context;

    targets.forEach(pid => {
        if (state.players[pid]) {
            const amount = EffectProcessor.resolveAmount(state, effect.amount, context, [pid]);
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

  public static handleLoseLife(state: GameState, effect: any, log: (m: string) => void, context: ResolutionContext) {
    const { EffectProcessor } = require('../EffectProcessor');
    const { targets } = context;

    targets.forEach(pid => {
        if (state.players[pid]) {
            const amount = EffectProcessor.resolveAmount(state, effect.amount, context, [pid]);
            state.players[pid].life -= amount;
            TriggerProcessor.onEvent(state, { type: 'ON_LIFE_LOSS', playerId: pid, amount }, log);
            log(`${state.players[pid].name} loses ${amount} life.`);
        }
    });
  }
}

