import {
  ActionType,
  GameState,
  StackObject,
  TargetDefinition,
  TriggeredAbility
} from "@shared/engine_types";
import { getProcessors } from "../../ProcessorRegistry";
import { LogCategory } from "../../../utils/EngineLogger";

/**
 * Triggered Abilities Module: Stack Management
 * Handles moving triggers from the pending queue to the stack in APNAP order.
 */
export class TriggerStacker {
  /**
   * CR 603.3b: "If multiple abilities have triggered... each player, in APNAP order,
   * puts any abilities they control on the stack in any order they choose."
   */
  public static processPendingTriggers(
    state: GameState
  ): boolean {
    const { logger } = getProcessors(state);
    if (!state.pendingTriggers || state.pendingTriggers.length === 0)
      return false;

    if (state.pendingAction) return false;

    // Rule 101.4: APNAP Order
    const apId = state.activePlayerId;
    const order = state.playerOrder;
    const apIndex = order.indexOf(apId);
    const apnapOrder = [...order.slice(apIndex), ...order.slice(0, apIndex)];

    for (const pId of apnapOrder) {
      const playersTriggers = state.pendingTriggers.filter(
        (t) => t.controllerId === pId,
      );
      if (playersTriggers.length === 0) continue;

      if (playersTriggers.length === 1) {
        const stackObj = playersTriggers[0];
        state.pendingTriggers = state.pendingTriggers.filter(
          (t) => t.id !== stackObj.id,
        );
        this.stackTrigger(state, stackObj);
        this.processPendingTriggers(state);
        return true;
      } else {
        const player = state.players[pId];
        if (player?.autoOrderTriggers) {
          for (const stackObj of playersTriggers) {
            state.pendingTriggers = state.pendingTriggers.filter(
              (q) => q.id !== stackObj.id,
            );
            this.stackTrigger(state, stackObj);
          }
          this.processPendingTriggers(state);
          return true;
        }

        logger.info(state, LogCategory.TRIGGER, `[TRIGGER-QUEUE] Player ${pId} must order ${playersTriggers.length} triggers.`);
        state.pendingAction = {
          type: ActionType.OrderTriggers,
          playerId: pId,
          data: { label: "OrderTriggers", triggers: playersTriggers },
        };
        return true;
      }
    }

    return false;
  }

  public static stackTrigger(
    state: GameState,
    stackObj: any,
  ) {
    const { logger } = getProcessors(state);

    // Rule 603.4: Intervening If (Double check at stacking time to avoid clutter)
    if (stackObj.condition) {
      const { condition: ConditionProcessor } = getProcessors(state);
      const context = {
        sourceId: stackObj.sourceId,
        controllerId: stackObj.controllerId,
        event: stackObj.event || stackObj.data?.event,
        stackObject: stackObj,
        effects: [],
        targets: stackObj.targets || []
      };

      if (!ConditionProcessor.matchesCondition(state, stackObj.condition, context)) {
        logger.info(state, LogCategory.TRIGGER, `[TRIGGER-SKIP] ${stackObj.name} (Source: ${stackObj.sourceId}) skipped stacking - condition no longer met.`);
        return;
      }
    }

    state.stack.push(stackObj);
    logger.info(state, LogCategory.TRIGGER, `[STACK-PUSH] Trigger ${stackObj.id} (Source: ${stackObj.sourceId}) pushed to stack.`);
    getProcessors(state).action.updateEntityCache(state, stackObj);
    state.consecutivePasses = 0;

    const targetDefinitions = stackObj.data?.targetDefinitions || stackObj.targetDefinitions;
    const sourceName = stackObj.data?.sourceName || stackObj.sourceName;

    if (targetDefinitions && targetDefinitions.length > 0) {
      this.initializeTriggerTargeting(
        state,
        stackObj.id,
        targetDefinitions,
        sourceName,
        stackObj,
      );
    } else {
      logger.info(state, LogCategory.TRIGGER, `[TRIGGER] ${sourceName} triggered.`);
    }
  }

  private static initializeTriggerTargeting(
    state: GameState,
    stackId: string,
    targetDefinitions: TargetDefinition[],
    sourceName: string,
    stackObj: StackObject,
  ) {
    const { logger, targeting: TargetingProcessor } = getProcessors(state);
    const legalTargetIds = [
      ...state.battlefield.map(o => o.id),
      ...state.stack.map(o => o.id),
      ...Object.keys(state.players),
    ].filter((tid) =>
      TargetingProcessor.isLegalTarget(state, {
        sourceId: stackObj.sourceId,
        controllerId: stackObj.controllerId,
        stackObject: stackObj,
        targetDefinitions: targetDefinitions,
        effects: [],
        targets: []
      }, tid)
    );

    if (legalTargetIds.length === 0) {
      if (stackObj.optional) {
        logger.info(state, LogCategory.TARGETING, `[TRIGGER] ${sourceName}: No legal targets. Optional trigger skipped.`);
        const onStack = state.stack.find((s) => s.id === stackId);
        if (onStack) onStack.targets = [];
      } else {
        logger.warn(state, LogCategory.TARGETING, `[ERROR] ${sourceName}: No legal targets for required trigger. Ability removed (Rule 603.3d).`);
        state.stack = state.stack.filter((s) => s.id !== stackId);
      }
      return;
    }

    state.pendingAction = {
      type: ActionType.Targeting,
      playerId: stackObj.controllerId,
      sourceId: stackObj.sourceId,
      data: {
        label: "ChooseTargets",
        targetDefinitions: targetDefinitions,
        targets: legalTargetIds,
        stackId: stackObj.id,
        stackObj: stackObj,
      },
    };
    state.priorityPlayerId = stackObj.controllerId;
    logger.info(state, LogCategory.TARGETING, `[TARGETING] ${state.players[stackObj.controllerId]?.name} choosing targets for ${sourceName}.`);
  }
}
