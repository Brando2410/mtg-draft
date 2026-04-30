import { AbilityType, EffectDefinition, GameState, StackObject, Zone } from '@shared/engine_types';
import { RuleUtils } from '../../../utils/RuleUtils';
import { oracle } from '../../../OracleLogicMap';
import { getProcessors } from '../../ProcessorRegistry';
import { EngineValidator } from '../logic/EngineValidator';

/**
 * Handles the management and resolution of objects on the stack (Rule 405)
 */
export class StackProcessor {

  /**
   * Retrieves the effects that should be executed when a stack object resolves.
   */
  public static getEffectsForResolution(state: GameState, objectToResolve: StackObject): EffectDefinition[] {
    // Priority 1: Effects already stored in stack object data during casting/activation
    let effects: EffectDefinition[] = objectToResolve.data?.effects || [];
    if (effects.length === 0) {
      const logic = oracle.getCard(objectToResolve.definition?.name || objectToResolve.card?.definition?.name || "");

      if (objectToResolve.type === AbilityType.Spell) {
        // Priority: Oracle Logic -> Definition Abilities -> Definition Effects
        const spellAbility = logic?.abilities?.find((a: any) => a.type === AbilityType.Spell) ||
          objectToResolve.definition?.abilities?.find((a: any) => a.type === AbilityType.Spell);
        effects = logic?.effects || (spellAbility as any)?.effects || [];
      }
      else if (objectToResolve.type === AbilityType.Activated) {
        const sourceObj = RuleUtils.findObject(state, objectToResolve.sourceId);

        if (sourceObj) {
          const cardLogic = oracle.getCard(sourceObj.definition.name);
          const ability = cardLogic?.abilities?.[objectToResolve.abilityIndex ?? -1] ||
            sourceObj.definition.abilities?.[objectToResolve.abilityIndex ?? -1];
          if (ability) {
            effects = ability.effects || [];
          }
        }
      }
    }

    return effects;
  }

  /**
   * Cleans up the stack and removes objects that are no longer valid.
   */
  public static cleanStack(state: GameState) {
    // rule 608.2b re-check could happen here
  }

  /**
   * Resolves the top object of the stack or advances the turn step if empty (Rule 117.4)
   */
  public static resolveTopOrAdvanceStep(
    state: GameState,
    engine: import('../../../interfaces/EngineContext').EngineContext,
    resolver: import('./StackResolver').StackResolver,
    log: (m: string) => void
  ) {
    if (EngineValidator.isSuspended(state)) {
      console.log(`[STACK-PROC] resolveTopOrAdvanceStep BLOCKED: Engine is suspended for ${state.pendingAction?.type}`);
      return;
    }

    if (state.stack.length > 0) {
      const objectToResolve = state.stack.pop();
      if (objectToResolve) {
        const processors = getProcessors(state);
        processors.lki.saveSnapshot(state, objectToResolve, Zone.Stack);
        state.consecutivePasses = 0; // CR 117.4: Resolution or stack changes reset pass count
        if (state.stack.length > 0) {
          console.log(`[DEBUG] STACK CONTENTS:`, state.stack.map(s => ({ id: s.id, name: (s as any).name || s.card?.definition.name, idx: (s as any).data?.nextEffectIndex })));
        }

        log(`--------------------------------------------------`);
        const objectName = (objectToResolve as any).name || objectToResolve.card?.definition.name || 'Effect';
        log(`[RESOLVING] >>> ${objectName} is resolving <<<`);

        const effects = StackProcessor.getEffectsForResolution(state, objectToResolve);
        const startIndex = (objectToResolve as any).data?.nextEffectIndex || 0;
        const completed = resolver.resolveObject(objectToResolve, effects, startIndex);

        if (!completed) {
          // Suspended resolution. Push the object back to the stack.
          if (!objectToResolve.data) objectToResolve.data = {};
          objectToResolve.data.nextEffectIndex = state.pendingAction?.data?.nextEffectIndex || 0;
          state.stack.push(objectToResolve);

          // During suspended resolution, priority is given to the player who must act
          state.priorityPlayerId = state.pendingAction?.playerId || null;
          return;
        }

        // --- KEYWORD HOOK: ON RESOLUTION ---
        console.log(`[STACK-DEBUG] ${objectName} resolved. type=${objectToResolve.type}, completed=${completed}`);
        if (completed && objectToResolve.type === AbilityType.Spell) {
          const { trigger: TriggerProcessor } = getProcessors(state);
          console.log(`[STACK-DEBUG] Firing ON_RESOLVE_SPELL for ${objectName}`);
          TriggerProcessor.onEvent(state, {
            type: 'ON_RESOLVE_SPELL',
            playerId: objectToResolve.controllerId,
            payload: { object: objectToResolve.card, sourceId: objectToResolve.sourceId }
          }, log);
        }

        const stackRemaining = state.stack.map(s => s.card?.definition.name || 'Effect').join(', ');
        if (stackRemaining) {
          log(`[STACK-LEFT] Still on stack: [${stackRemaining}]`);
        } else {
          log(`[STACK-EMPTY] The stack is now empty.`);
        }
        log(`--------------------------------------------------`);
        engine.resetPriorityToActivePlayer();
      }
    } else {
      engine.advanceStep();
    }
  }
}
