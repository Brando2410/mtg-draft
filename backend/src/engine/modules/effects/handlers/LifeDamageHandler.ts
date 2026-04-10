import { GameState, PlayerId } from '@shared/engine_types';
import { DamageProcessor } from '../../combat/DamageProcessor';
import { TriggerProcessor } from '../TriggerProcessor';

/**
 * Strategy for CR 119: Damage and CR 120: Life
 */
export class LifeDamageHandler {

  public static handleDamage(state: GameState, targets: string[], amount: number, sourceId: string, log: (m: string) => void) {
    targets.forEach(tid => DamageProcessor.dealDamage(state, sourceId, tid, amount, false, log));
  }

  public static handleGainLife(state: GameState, targets: string[], amount: number, log: (m: string) => void) {
    targets.forEach(pid => {
        if (state.players[pid]) {
            const oldLife = state.players[pid].life;
            state.players[pid].life += amount;
            state.turnState.lastLifeGainedAmount = amount;
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

  public static handleLoseLife(state: GameState, targets: string[], amount: number, log: (m: string) => void) {
    targets.forEach(pid => {
        if (state.players[pid]) {
            state.players[pid].life -= amount;
            TriggerProcessor.onEvent(state, { type: 'ON_LIFE_LOSS', playerId: pid, amount }, log);
            log(`${state.players[pid].name} loses ${amount} life.`);
        }
    });
  }
}
