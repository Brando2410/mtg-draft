import { EffectDefinition, GameState, StackObject, Zone } from '@shared/engine_types';
import { LogCategory } from '../../../utils/EngineLogger';
import { RuleUtils } from '../../../utils/RuleUtils';
import { RegistryUtils } from '../../../utils/RegistryUtils';
import { getProcessors } from '../../ProcessorRegistry';
import { EngineValidator } from '../logic/EngineValidator';
import { ResolutionManager } from './ResolutionManager';

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
          const stackNames = state.stack.map(s => s.name || s.sourceObject?.definition.name || 'Effect');
          logger.debug(state, LogCategory.STACK, `STACK CONTENTS (Remaining): ${stackNames.join(', ')}`);
        }

        const objectName = objectToResolve.name || objectToResolve.sourceObject?.definition.name || 'Effect';
        logger.info(state, LogCategory.STACK, `[RESOLVING] >>> ${objectName} is resolving <<<`);

        const effects = StackProcessor.getEffectsForResolution(state, objectToResolve);
        if (!objectToResolve.effects) objectToResolve.effects = effects;
        
        const effectIndex = objectToResolve.effectIndex ?? 0;
        const completed = ResolutionManager.resolve(state, objectToResolve, effects, engine, effectIndex);

        if (!completed) {
          // Suspended resolution. Push the object back to the stack.
          state.stack.push(objectToResolve);
          state.priorityPlayerId = state.pendingAction?.playerId || null;
          return;
        }

        const stackRemaining = state.stack.map(s => s.sourceObject?.definition.name || 'Effect').join(', ');
        if (stackRemaining) {
          logger.info(state, LogCategory.STACK, `[STACK-LEFT] Still on stack: [${stackRemaining}]`);
        } else {
          logger.info(state, LogCategory.STACK, `[STACK-EMPTY] The stack is now empty.`);
        }
        
        // CR 117.3b: The active player receives priority after a spell or ability resolves.
        engine.resetPriorityToActivePlayer();
      }
    } else {
      // CR 117.4: Only advance the step if ALL players have passed in succession.
      if (state.consecutivePasses >= state.playerOrder.length) {
        engine.advanceStep();
      } else {
        logger.debug(state, LogCategory.STACK, `resolveTopOrAdvanceStep: Stack is empty but only ${state.consecutivePasses} passes. Waiting for priority.`);
      }
    }
  }

  /**
   * Centralized UI metadata refresh for stack objects.
   */
  public static refreshTargetMetadata(state: GameState, stackObj: StackObject, targets: string[]): void {
    stackObj.targets = targets;

    stackObj.targetsControllers = targets.map((tid: string) => {
      const obj = RuleUtils.findObject(state, tid);
      return RuleUtils.isPlayer(obj) ? obj.id : (RuleUtils.isEntity(obj) ? obj.controllerId : null);
    }) as string[];

    const targetNames = targets.map((tid: string) => {
      const obj = RuleUtils.findObject(state, tid);
      return RuleUtils.isEntity(obj) ? obj.definition.name : (RuleUtils.isPlayer(obj) ? obj.name : tid);
    });

    if (targetNames.length > 0) {
      stackObj.summary = `targeting ${targetNames.join(', ')}`;
    }
  }

  /**
   * Ensures a stack object is on the stack exactly once.
   */
  public static ensureOnStack(state: GameState, stackObj: StackObject): boolean {
    const isAlreadyOnStack = state.stack.some(s => s === stackObj || s.id === stackObj.id);
    if (!isAlreadyOnStack) {
      state.stack.push(stackObj);
      state.isSticky = true;
      getProcessors(state).action.updateEntityCache(state, stackObj);
      return true;
    }
    return false;
  }
}
