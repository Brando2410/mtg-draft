import { AbilityType, EffectDefinition, GameState, StackObject, Zone } from '@shared/engine_types';
import { LogCategory } from '../../../utils/EngineLogger';
import { RuleUtils } from '../../../utils/RuleUtils';
import { RegistryUtils } from '../../../utils/RegistryUtils';
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
    // Priority 1: Effects already stored on the stack object (calculated during casting/activation)
    if (objectToResolve.effects && objectToResolve.effects.length > 0) {
      return objectToResolve.effects;
    }

    // Priority 2: Fallback to extraction (for copies or legacy stack objects)
    const { effects } = RegistryUtils.getEffectivePayload(state, objectToResolve);
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
  ) {
    const { logger } = getProcessors(state);
    if (EngineValidator.isSuspended(state)) {
      logger.debug(state, LogCategory.STACK, `resolveTopOrAdvanceStep BLOCKED: Engine is suspended for ${state.pendingAction?.type}`);
      return;
    }

    if (state.stack.length > 0) {
      const objectToResolve = state.stack.pop();
      if (objectToResolve) {
        const processors = getProcessors(state);
        processors.lki.saveSnapshot(state, objectToResolve, Zone.Stack);
        state.consecutivePasses = 0; // CR 117.4: Resolution or stack changes reset pass count
        if (state.stack.length > 0) {
          logger.debug(state, LogCategory.STACK, `STACK CONTENTS: ${state.stack.map(s => s.name || s.sourceObject?.definition.name).join(', ')}`);
        }

        const objectName = objectToResolve.name || objectToResolve.sourceObject?.definition.name || 'Effect';
        logger.info(state, LogCategory.STACK, `[RESOLVING] >>> ${objectName} is resolving <<<`);

        const effects = StackProcessor.getEffectsForResolution(state, objectToResolve);
        // CR 608.2: Ensure the stack object tracks its primary effects list for resolution state management.
        if (!objectToResolve.effects) objectToResolve.effects = effects;
        
        const startIndex = objectToResolve.resolution?.effectIndex ?? objectToResolve.nextEffectIndex ?? 0;
        const completed = resolver.resolveObject(objectToResolve, effects, startIndex);

        if (!completed) {
          // Suspended resolution. Push the object back to the stack.
          // Note: EffectProcessor.resolveEffects already populated stackObject.resolution
          state.stack.push(objectToResolve);

          // During suspended resolution, priority is given to the player who must act
          state.priorityPlayerId = state.pendingAction?.playerId || null;
          return;
        }

        // --- KEYWORD HOOK: ON RESOLUTION ---
        logger.debug(state, LogCategory.STACK, `${objectName} resolved. type=${objectToResolve.type}, completed=${completed}`);
        if (completed && objectToResolve.type === AbilityType.Spell) {
          const { trigger: TriggerProcessor } = getProcessors(state);
          logger.debug(state, LogCategory.STACK, `Firing ON_RESOLVE_SPELL for ${objectName}`);
          TriggerProcessor.onEvent(state, {
            type: 'ON_RESOLVE_SPELL',
            playerId: objectToResolve.controllerId,
            payload: { object: objectToResolve.sourceObject, sourceId: objectToResolve.sourceId }
          });
        }

        const stackRemaining = state.stack.map(s => s.sourceObject?.definition.name || 'Effect').join(', ');
        if (stackRemaining) {
          logger.info(state, LogCategory.STACK, `[STACK-LEFT] Still on stack: [${stackRemaining}]`);
        } else {
          logger.info(state, LogCategory.STACK, `[STACK-EMPTY] The stack is now empty.`);
        }
        engine.resetPriorityToActivePlayer();
      }
    } else {
      engine.advanceStep();
    }
  }
}
