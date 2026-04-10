import { GameState, GameObjectId, PlayerId, ActionType, ContinuousEffect, EffectDefinition, Zone } from '@shared/engine_types';
import { ActionProcessor } from '../../actions/ActionProcessor';
import { TriggerProcessor } from '../TriggerProcessor';

/**
 * Strategy for CR 601: Casting Spells and CR 701: Keyword Actions (System/Control)
 */
export class ControlEffectHandler {

  public static handle(
    state: GameState,
    effect: any,
    sourceId: string,
    targets: string[],
    log: (m: string) => void,
    controllerId: PlayerId,
    stackObject?: any,
    parentContext?: any,
    findObject?: any
  ) {
    switch (effect.type) {
      case 'EndTurn':
        log(`[END-TURN] Ending the turn. Exiling stack...`);
        state.stack = [];
        state.pendingAction = undefined;
        break;

      case 'Shuffle':
        const player = state.players[targets[0] as PlayerId] || state.players[controllerId];
        if (player) {
            ActionProcessor.shuffle(player.library);
            log(`[SHUFFLE] ${player.name} shuffled library.`);
        }
        break;

      case 'Log':
        log(effect.message || "");
        break;

      case 'CopySpellOnStack':
        targets.forEach(tid => {
            const stackObj = state.stack.find(s => s.id === tid || s.sourceId === tid);
            if (!stackObj) return;
            const copy = JSON.parse(JSON.stringify(stackObj));
            copy.id = `copy_${Date.now()}_${Math.random()}`;
            (copy as any).isCopy = true;
            copy.controllerId = controllerId;
            state.stack.push(copy);
            log(`[COPY] Created copy of ${stackObj.card?.definition.name || 'spell'}.`);
        });
        break;

      case 'AddTriggeredAbility':
        state.ruleRegistry.triggeredAbilities.push({
            id: `delayed_${Date.now()}`,
            sourceId: sourceId,
            controllerId: controllerId,
            eventMatch: effect.eventMatch || effect.on,
            activeZone: 'Any',
            duration: { type: (effect.duration || 'UNTIL_END_OF_TURN') as any },
            ...effect
        });
        break;

      case 'AddPreventionEffect':
        if (!state.ruleRegistry.preventionEffects) state.ruleRegistry.preventionEffects = [];
        state.ruleRegistry.preventionEffects.push({
            id: `prevention_${Date.now()}`,
            sourceId,
            controllerId,
            damageType: effect.damageType || 'CombatDamage',
            targetMapping: effect.targetMapping,
            duration: effect.duration || 'UntilEndOfTurn'
        });
        break;

      case 'PhasedOut':
        targets.forEach(tid => {
            const obj = findObject(state, tid, stackObject, parentContext);
            if (obj) {
                obj.isPhasedOut = effect.value !== false;
                log(`${obj.definition.name} phased ${obj.isPhasedOut ? 'out' : 'in'}.`);
            }
        });
        break;

      case 'AddMana':
        const { ManaProcessor } = require('../../magic/ManaProcessor');
        targets.forEach(tid => {
            const p = state.players[tid as PlayerId];
            if (p) {
                const res = ManaProcessor.parseManaCost(`{${effect.value || effect.amount || 'C'}}`);
                Object.entries(res.colored).forEach(([s, a]) => (p.manaPool as any)[s] += (a as number));
                p.manaPool['C'] += res.generic;
            }
        });
        break;
    }
  }
}
