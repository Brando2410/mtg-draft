import { DamageEffect, EffectDefinition, GameState, LifeEffect, ResolutionContext } from '@shared/engine_types';
import { LogCategory } from '../../../../utils/EngineLogger';
import { getProcessors } from '../../../ProcessorRegistry';

/**
 * Strategy for CR 119: Damage and CR 120: Life
 */
export class LifeDamageHandler {

  public static handleDamage(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
    const { effect: EP, targeting: TP, damage: DP } = getProcessors(state);
    const { targets, sourceId } = context;
    const damageEff = effect as DamageEffect;

    targets.forEach(tid => {
      const sourceMappingIds = damageEff.damageSourceMapping ? TP.resolveTargetMapping(state, damageEff.damageSourceMapping, context, effect) : [];
      const usedSourceId = sourceMappingIds[0] || (damageEff as any).damageSourceId || sourceId;
      const amt = EP.resolveAmount(state, damageEff.amount, context, [tid]);
      DP.dealDamage(state, usedSourceId, tid, amt, false);
    });
  }

  public static handleGainLife(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
    const { logger, effect: EP, restriction: RV, trigger: TrP } = getProcessors(state);
    const { targets } = context;
    const lifeEff = effect as LifeEffect;

    targets.forEach(pid => {
      if (state.players[pid]) {
        if (!RV.canGainLife(state, pid)) {
          logger.info(state, LogCategory.ACTION, `${state.players[pid].name} cannot gain life due to a restriction.`);
          return;
        }
        const amount = EP.resolveAmount(state, lifeEff.amount, context, [pid]);
        const oldLife = state.players[pid].life;
        state.players[pid].life += amount;
        state.turnState.lastLifeGainedAmount = amount;
        state.turnState.lifeGainedThisTurn[pid] = (state.turnState.lifeGainedThisTurn[pid] || 0) + amount;
        logger.info(state, LogCategory.ACTION, `${state.players[pid].name} gains ${amount} life (${oldLife} -> ${state.players[pid].life})`);

        TrP.onEvent(state, {
          type: 'ON_LIFE_GAIN',
          playerId: pid,
          amount,
          data: { amount }
        });
      }
    });
  }

  public static handleLoseLife(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
    const { logger, effect: EP, trigger: TrP } = getProcessors(state);
    const { targets } = context;
    const lifeEff = effect as LifeEffect;

    targets.forEach(pid => {
      if (state.players[pid]) {
        const amount = EP.resolveAmount(state, lifeEff.amount, context, [pid]);
        state.players[pid].life -= amount;
        TrP.onEvent(state, { type: 'ON_LIFE_LOSS', playerId: pid, amount });
        logger.info(state, LogCategory.ACTION, `${state.players[pid].name} loses ${amount} life.`);
      }
    });
  }
}



