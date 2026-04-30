import {
  ActionType,
  AmountResolver,
  ConditionType,
  EffectDefinition,
  EffectType, GameObject, GameState, PlayerId,
  ResolutionContext,
  StackObject,
  TargetDefinition,
  TargetMapping, TargetType
} from "@shared/engine_types";
import { LogCategory } from "../../utils/EngineLogger";
import { Targetable } from "@shared/types/targeting";
import {
  EffectExecutionOptions
} from "../../interfaces/EngineContext";
import { RuleUtils } from "../../utils/RuleUtils";
import { getProcessors } from "../ProcessorRegistry";
import { EffectRegistry } from "./EffectRegistry";

// Static imports for performance - DEPRECATED: use getProcessors(state)

/**
 * Prunes a context to avoid infinite depth serialization issues in Socket.io
 */
export const pruneContext = (ctx: ResolutionContext | undefined): ResolutionContext | undefined => {
  if (!ctx) return undefined;
  // If context is already 3 levels deep, we stop nesting to prevent "Max Call Stack" errors
  let depth = 0;
  let curr: ResolutionContext | undefined = ctx;
  while (curr?.parentContext) {
    depth++;
    curr = curr.parentContext;
    if (depth > 2) {
      // Prune the deepest context
      const pruned = { ...ctx };
      delete pruned.parentContext;
      return pruned;
    }
  }
  return ctx;
};

/**
 * Rules Engine Module: Effect Resolution (Rule 608/609)
 * Interprets EffectDefinitions and translates them into GameState mutations.
 *
 * DESIGN: Strategy-based architecture. Logic delegated to handlers/.
 */
export interface ResolveEffectsOptions {
  state: GameState;
  effects: EffectDefinition[];
  sourceId: string;
  targets: string[];
  startIndex?: number;
  stackObject?: StackObject;
  parentContext?: ResolutionContext;
  controllerIdOverride?: PlayerId;
  lookingCards?: GameObject[];
}

export class EffectProcessor {
  public static getEffectHandler(type: EffectType | string) {
    return EffectRegistry[type];
  }

  public static resolveEffects(options: ResolveEffectsOptions): boolean {
    const {
      state,
      effects,
      sourceId,
      targets,
      startIndex = 0,
      stackObject,
      parentContext,
      controllerIdOverride,
      lookingCards
    } = options;
    const { logger } = getProcessors(state);

    // CR 608.2b: Check target legality on resolution (Fizzle check)
    // MTG Rule: The check is made once as the spell or ability starts to resolve from the stack.
    // If all its targets are now illegal, the spell or ability is countered.
    // We only run this on the ROOT resolution (parentContext === null) to avoid nested sub-effects triggering it.
    if (startIndex === 0 && !parentContext && targets.length > 0 && effects.some(e => {
      const tm = (e.targetMapping || "").toString();
      return tm.startsWith('TARGET_') || tm === TargetMapping.TargetOpponent || tm === TargetMapping.TargetPlayer;
    })) {
      const { targeting: TP } = getProcessors(state);

      const fizzle = TP.shouldFizzle(state, {
        sourceId,
        controllerId: controllerIdOverride || state.activePlayerId,
        stackObject
      }, targets, effects);

      if (fizzle) {
        logger.info(state, LogCategory.ACTION, `[FIZZLE] ${stackObject?.card?.definition.name || "Spell"}: All targets have become illegal.`);
        return true; // Return true as fully resolved (but fizzled)
      }
    }

    for (let i = startIndex; i < effects.length; i++) {
      const effect = effects[i];
      logger.debug(state, LogCategory.ACTION, `[DEBUG] EffectProcessor: Executing effect ${i}/${effects.length}: ${effect.type}. Targets: ${JSON.stringify(targets)}. Index: ${i}, StartIndex: ${startIndex}`);

      this.executeEffect({
        state,
        effect,
        sourceId,
        validTargetIds: targets, // Note: targets here is the initial set, executeEffect resolves mappings
        stackObject,
        parentContext,
        controllerIdOverride,
        lookingCards,
      });

      if (state.pendingAction) {
        // Rule 603.3: Prune the stored objects to avoid recursion depth and circular references in sockets.
        const slimStackObj = this.slimStackObj(state, stackObject);

        if (
          state.pendingAction.data?.stackObj &&
          state.pendingAction.data?.effects
        ) {
          // If we already have a suspended state, do not overwrite it.
          return false;
        }

        if (stackObject) {
          if (!stackObject.data) stackObject.data = {};
          stackObject.data.nextEffectIndex = i + 1;
        }

        state.pendingAction.data = {
          label: "Resolution",
          ...(state.pendingAction.data || {}),
          effects: effects.map((e) => ({ ...e })),
          nextEffectIndex: i + 1,
          targets: state.pendingAction.data?.targets || targets,
          stackObj: slimStackObj || undefined,
          parentContext: pruneContext(parentContext),
        };
        state.priorityPlayerId = state.pendingAction.playerId;
        return false;
      }
    }
    if (stackObject && stackObject.data)
      stackObject.data.nextEffectIndex = effects.length;

    return true;
  }

  private static slimStackObj(state: GameState, stackObject: StackObject | undefined): StackObject | null {
    if (stackObject) {
      // Recover name/image if missing (triggers often lose metadata in engine internals)
      let name = stackObject.name;
      let imageUrl = stackObject.image_url;

      const source = RuleUtils.findObject(
        state,
        stackObject.sourceId,
      ) as GameObject | undefined;

      if (!name || !imageUrl) {
        if (source) {
          if (!name) name = `${source.definition.name}'s Trigger`;
          if (!imageUrl)
            imageUrl =
              source.definition.image_url;
        }
      }

      return {
        id: stackObject.id,
        name: name,
        image_url: imageUrl,
        type: stackObject.type,
        sourceId: stackObject.sourceId,
        controllerId: stackObject.controllerId,
        definition: source?.definition, // Pass the definition for clean rendering
        targets: stackObject.targets || [],
        data: stackObject.data,
      } as unknown as StackObject;
    }
    return null;
  }

  public static executeEffect(options: EffectExecutionOptions) {
    const {
      state,
      effect,
      sourceId,
      stackObject,
      parentContext,
      controllerIdOverride,
      lookingCards,
    } = options;
    const { logger } = getProcessors(state);
    const targets = options.validTargetIds || [];

    const sourceObj =
      this.findObject(state, sourceId, stackObject, parentContext) ||
      (stackObject?.card ? stackObject.card : stackObject);
    const controllerId =
      (controllerIdOverride || (sourceObj as GameObject)?.controllerId || state.activePlayerId) as PlayerId;
    const { targeting: TP } = getProcessors(state);

    // Create a ResolutionContext for handlers that expect it
    const context: ResolutionContext = {
      sourceId,
      controllerId,
      targets,
      effects: stackObject?.data?.effects || [effect],
      stackObject,
      parentContext,
      startIndex: stackObject?.data?.startIndex || 0,
      event: stackObject?.data?.eventData || (stackObject?.data as any)?.event,
      exiledIds: stackObject?.data?.exiledIds,
      lookingCards: (lookingCards || stackObject?.data?.lookingCards || parentContext?.lookingCards) as GameObject[],
      nextEffectIndex: stackObject?.data?.nextEffectIndex,
      xValue: stackObject?.xValue || parentContext?.xValue,
      isCopy: stackObject?.data?.isCopy || parentContext?.isCopy
    };

    if (!state.executionTrace) state.executionTrace = [];
    state.executionTrace.push({
      type: effect.type,
      sourceId,
      controllerId,
      targets,
      timestamp: Date.now(),
      xValue: context.xValue,
      nextEffectIndex: context.nextEffectIndex
    });


    // Rule 608.2: Evaluate conditions
    if (effect.condition) {
      const met = this.checkCondition(state, effect.condition, context);
      if (!met) {
        if (effect.onFailureEffects) {
          return this.resolveEffects({
            state,
            effects: effect.onFailureEffects,
            sourceId,
            targets,
            startIndex: 0,
            stackObject,
            parentContext,
            controllerIdOverride,
          });
        }
        return;
      }
    }

    // Resolve Target Mappings
    const resolveMapping = (m: string | TargetMapping | undefined, index: number) => {
      const ids = TP.resolveTargetMapping(
        state,
        m || "",
        context,
        effect,
      ) as string[];

      // If Choice effect has no explicit mapping, it should receive all parent targets to pass them down
      if (effect.type === EffectType.Choice && (!m || m === "") && ids.length === 0) {
        return ids.length > 0 ? ids : [...targets];
      }

      const mStr = (m || "").toString().toUpperCase();
      const isDirectTargetMapping = mStr.startsWith("TARGET_") && !isNaN(parseInt(mStr.substring(7))) && mStr.split("_").length === 2;
      let validationIndex = index;
      if (isDirectTargetMapping) validationIndex = parseInt(mStr.substring(7)) - 1;

      if (isDirectTargetMapping || (
        [
          TargetMapping.TargetOpponent,
          TargetMapping.TargetPlayer,
          TargetMapping.TargetCreature,
          TargetMapping.TargetPermanent,
        ] as string[]
      ).includes(mStr)) {
        return this.getValidTargetIds(state, effect, ids, context, validationIndex);
      }

      return ids;
    };

    let validTargetIds = resolveMapping(effect.targetMapping, 0);
    if (
      effect.targetId &&
      !validTargetIds.includes(effect.targetId)
    ) {
      validTargetIds.push(effect.targetId);
    }
    if (effect.targetIds && Array.isArray(effect.targetIds)) {
      effect.targetIds.forEach((tid: string) => {
        if (!validTargetIds.includes(tid)) validTargetIds.push(tid);
      });
    }

    // CR 608.2c: If an effect has no target mapping specified, it defaults to the controller for player-centric actions
    if (!effect.targetMapping && validTargetIds.length === 0) {
      if (
        ([
          EffectType.CreateToken,
          EffectType.DrawCards,
          EffectType.Scry,
          EffectType.Surveil,
          EffectType.AddMana,
          EffectType.Learn,
          EffectType.Mill,
        ] as EffectType[]).includes(effect.type)
      ) {
        validTargetIds = [controllerId];
      }
    }
    const validTarget2Ids = effect.target2Mapping
      ? resolveMapping(effect.target2Mapping, 1)
      : [];

    // CR 608.2b: Legality check moved to resolveEffects to prevent middle-of-resolution fizzling
    // (e.g. when an effect moves its own target, like Destroy)

    if (
      (effect.targetMapping &&
        validTargetIds.length === 0 &&
        !effect.targetId &&
        !effect.targetDefinition) ||
      (effect.target2Mapping &&
        validTarget2Ids.length === 0 &&
        !effect.targetDefinition)
    ) {
      if (effect.type === EffectType.Fight) return;
      return;
    }

    const amount =
      effect.amount !== undefined
        ? this.resolveAmount(
          state,
          effect.amount,
          context,
          validTargetIds,
        )
        : 1;

    // Generic Interactive Selection support
    if (
      effect.targetDefinition &&
      validTargetIds.length === 0 &&
      !effect.targetMapping &&
      !([
        EffectType.SearchLibrary,
        EffectType.Choice,
        EffectType.LookAtTopAndPick,
        EffectType.Scry,
        EffectType.Surveil,
      ] as EffectType[]).includes(effect.type)
    ) {
      return this.resolveInteractiveEffectSelection(
        state,
        effect,
        sourceId,
        controllerId,
        stackObject,
        parentContext,
      );
    }

    // Registry Dispatcher
    const handler = EffectRegistry[effect.type];
    if (handler) {
      return handler.handle(state, effect, {
        ...context,
        targets: validTargetIds,
      });
    }

    // Strategy Dispatcher (Legacy) - DEPRECATED: All effects now use the Registry
    if (!EffectRegistry[effect.type]) {
      logger.info(state, LogCategory.ACTION, `[WARNING] Unknown/Unregistered effect type: ${effect.type}`);
    }
  }

  /* --- Internal Rules Engine Logic --- */

  private static getValidTargetIds(
    state: GameState,
    effect: EffectDefinition,
    ids: string[],
    context: ResolutionContext,
    validationIndex: number = 0,
  ): string[] {
    const { sourceId, stackObject, parentContext } = context;
    return ids.filter((tid, index) => {
      if (!tid) return false;
      if (state.players[tid as PlayerId]) return true;
      const obj = this.findObject(state, tid, stackObject, parentContext);
      if (!obj) return false;
      if (tid === sourceId) return true; // Source is always a legal part of its own mapping (Rule 608.2b)

      // Choice and SearchLibrary often use mappings to players/zones that shouldn't be matched against the main target definition
      if (
        ([
          EffectType.Choice,
          EffectType.SearchLibrary,
          EffectType.Scry,
          EffectType.Surveil,
          EffectType.MoveToZone,
          EffectType.Exile,
          EffectType.PutOnBattlefield,
          EffectType.ReturnToHand,
        ] as EffectType[]).includes(effect.type)
      )
        return true;

      if ([TargetMapping.SelectedCard, TargetMapping.EventTarget].includes(effect.targetMapping as any))
        return true;
      const targetDef =
        effect.targetDefinition ||
        (stackObject || parentContext?.stackObject)?.data?.targetDefinition;
      if (!targetDef) return true;

      const { targeting: TP } = getProcessors(state);
      return TP.isLegalTarget(
        state,
        {
          sourceId,
          controllerId: context.controllerId,
          stackObject,
          targetDef,
          targetIndex: validationIndex !== undefined ? validationIndex : index,
        },
        tid,
      );
    });
  }

  private static checkCondition(
    state: GameState,
    condition: ConditionType,
    context: ResolutionContext,
  ): boolean {
    const { condition: CP } = getProcessors(state);
    const { sourceId, controllerId, targets, stackObject } = context;

    // We wrap the stackObject/parent state into a clean ConditionContext
    const event = (context.event || { ...(stackObject || {}), targets }) as any;

    return CP.matchesCondition(state, condition, {
      sourceId,
      controllerId,
      event: event as any,
      stackObject,
      targets,
      effectSourceId: sourceId,
    });
  }

  public static resolveAmount(
    state: GameState,
    amount: number | string | AmountResolver | ((...args: any[]) => number) | undefined,
    context: ResolutionContext,
    targetIds: string[] = [],
  ): number {
    return RuleUtils.resolveAmount(state, amount, { ...context, targets: targetIds });
  }

  public static findObject(
    state: GameState,
    id: string,
    stackObject?: StackObject,
    parentContext?: ResolutionContext,
  ): Targetable | undefined {
    // Priority 1: LKI Snapshot (Rule 608.2h)
    const processors = getProcessors(state);
    const snapshot = processors.lki.getLki(state, id);
    if (snapshot && snapshot.id === id) return snapshot;

    return (
      RuleUtils.findObject(state, id) ||
      ((state.pendingAction?.data as any)?.lookingCards as GameObject[])?.find(
        (o) => o.id === id,
      ) ||
      (parentContext?.lookingCards as GameObject[])?.find((o) => o.id === id) ||
      (stackObject?.data?.lookingCards as GameObject[])?.find(
        (o) => o.id === id,
      )
    );
  }

  private static resolveInteractiveEffectSelection(
    state: GameState,
    effect: EffectDefinition,
    sourceId: string,
    controllerId: PlayerId,
    stackObject?: StackObject,
    parentContext?: ResolutionContext,
  ) {
    const { choiceGenerator: ChoiceGenerator, targeting: TP, logger } = getProcessors(state);
    const targetDef = Array.isArray(effect.targetDefinition)
      ? effect.targetDefinition[0]
      : effect.targetDefinition!;
    if (!targetDef) return;

    const player = state.players[controllerId];
    if (!player) return;

    let pool: GameObject[] = [];
    if (
      targetDef.type === TargetType.CardInHand
    ) {
      pool = player.hand;
    } else if (
      targetDef.type === TargetType.CardInGraveyard
    ) {
      pool = Object.values(state.players).flatMap((p) => p.graveyard);
    } else if (
      targetDef.type === TargetType.Permanent ||
      (targetDef.type as string) === "PERMANENT" ||
      (targetDef.type as string).toLowerCase().includes("permanent") ||
      (targetDef.type as string).toLowerCase() === "nonland" ||
      (targetDef.type as string).toLowerCase().includes("creature") ||
      (targetDef.type as string).toLowerCase().includes("planeswalker") ||
      (targetDef.type as string).toLowerCase().includes("artifact") ||
      (targetDef.type as string).toLowerCase().includes("enchantment")
    ) {
      pool = state.battlefield;
    } else {
      // Fallback for general cards or spells
      pool = [
        ...Object.values(state.players).flatMap((p) => [
          ...p.hand,
          ...p.graveyard,
        ]),
        ...state.battlefield,
      ];
    }

    const getRestrictions = (td: TargetDefinition) => {
      if (!td) return [];
      const res = [...(td.restrictions || [])];
      const typeStr = td.type as string;
      if (
        typeStr &&
        ![
          "ANY",
          "CARD",
          "PLAYER",
          "OPPONENT",
          "ANY_TARGET",
          "CARD_IN_GRAVEYARD",
          "CARD_IN_HAND",
          "CARD_IN_LIBRARY",
          "SELF",
          "PERMANENT",
          "SPELL",
        ].includes(typeStr)
      ) {
        res.push(typeStr);
      }
      return res;
    };

    const searchRestrictions = [
      ...(effect.restrictions || []),
      ...getRestrictions(targetDef),
    ];
    const validCandidates = pool.filter((c) =>
      TP.matchesRestrictions(
        state,
        c,
        searchRestrictions,
        {
          sourceId,
          controllerId,
          stackObject
        }
      ),
    );

    if (validCandidates.length === 0) {
      logger.info(state, LogCategory.ACTION, `[INFO] EffectProcessor: No valid targets for interactive selection. Skipping.`);
      return;
    }

    const resolvedContext: ResolutionContext = {
      sourceId,
      controllerId,
      targets: [],
      effects: [effect],
      stackObject,
    };
    const resolvedMax = this.resolveAmount(
      state,
      targetDef.count as unknown as number || 1,
      resolvedContext,
    );
    const resolvedMin =
      targetDef.minCount !== undefined
        ? this.resolveAmount(state, targetDef.minCount, resolvedContext)
        : targetDef.optional
          ? 0
          : resolvedMax;

    const isBattlefieldTarget = [
      TargetType.Permanent,
      TargetType.Creature,
      TargetType.Artifact,
      TargetType.Enchantment,
      TargetType.Planeswalker,
      TargetType.Land,
      TargetType.AnyTarget,
      TargetType.Player,
      TargetType.Opponent,
    ].some(t => String(targetDef.type).toUpperCase().includes(String(t).toUpperCase()));

    if (isBattlefieldTarget) {
      state.pendingAction = {
        type: ActionType.Targeting,
        playerId: controllerId,
        sourceId: sourceId,
        data: {
          label: effect.label || `Choose target for ${sourceId}`,
          targetDefinition: targetDef,
          targets: validCandidates.map(c => c.id),
          stackObj: stackObject,
          parentContext: pruneContext(parentContext),
          nextEffectIndex: parentContext?.nextEffectIndex,
          effects: parentContext?.effects || [effect],
          xValue: stackObject?.xValue
        }
      };
      logger.info(state, LogCategory.ACTION, `[TARGETING] Prompting for battlefield targeting for effect resolution...`);
      return;
    }

    state.pendingAction = ChoiceGenerator.createCardChoice(state, pool, {
      label: effect.label || `Select up to ${resolvedMax} target(s)`,
      playerId: controllerId,
      sourceId: sourceId,
      restrictions: searchRestrictions,
      filterSelectable: true,
      optional: targetDef.optional || effect.optional,
      minChoices: resolvedMin,
      maxChoices: resolvedMax,
      actionType:
        targetDef.optional || effect.optional
          ? ActionType.OptionalAction
          : ActionType.ResolutionChoice,
      onSelected: (selected: GameObject | GameObject[]) => {
        const selectedIds = Array.isArray(selected)
          ? selected.map((s) => s.id)
          : [selected.id];

        return [
          {
            ...effect,
            targetDefinition: undefined, // Clear to avoid re-triggering interactive loop
            targetMapping: undefined,
            targetIds: selectedIds,
          },
        ];
      },
      onNone: () => [],
      stackObj: this.slimStackObj(state, stackObject),
      parentContext: pruneContext(parentContext),
    });
  }
}
