import {
  ActionType,
  AmountResolver,
  ConditionType,
  EffectDefinition,
  EffectType, GameObject, GameState, PlayerId,
  NumericProperty,
  EngineFrame,
  StackObject,
  TargetDefinition,
  TargetMapping, TargetType, Zone
} from "@shared/engine_types";
import { LogCategory } from "../../utils/EngineLogger";
import { Targetable } from "@shared/types/targeting";
import {
  EffectExecutionOptions,
  ResolveEffectsOptions
} from "../../interfaces/EngineContext";
import { RuleUtils } from "../../utils/RuleUtils";
import { getProcessors } from "../ProcessorRegistry";
import { EffectRegistry } from "./EffectRegistry";
import { ManaProcessor } from "../magic/ManaProcessor";
import { getActionMeta } from '@shared/utils/ActionUtils';


/**
 * Prunes a context to avoid infinite depth serialization issues in Socket.io
 */
export const pruneContext = (ctx: EngineFrame | undefined): EngineFrame | undefined => {
  if (!ctx) return undefined;
  // If context is already 3 levels deep, we stop nesting to prevent "Max Call Stack" errors
  let depth = 0;
  let curr: EngineFrame | undefined = ctx;
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

export interface BaseResolveInputs {
  sourceId: string;
  effects?: EffectDefinition[];
  targets?: string[];
  validTargetIds?: string[]; // Alias for executeEffect
  stackObject?: StackObject;
  parentContext?: EngineFrame;
  controllerIdOverride?: PlayerId;
  lookingCards?: GameObject[];
  lastMilledIds?: string[];
  lastDiscardedIds?: string[];
  effectIndex?: number;
  isResumption?: boolean;
  exileOnResolution?: boolean;
}

export class EffectProcessor {

  public static injectPostEffect(context: EngineFrame, effect: EffectDefinition) {
    if (!context.effects) {
      context.effects = [];
    }
    const insertAt = (context.effectIndex ?? 0) + 1;
    context.effects.splice(insertAt, 0, effect);
  }

  /**
   * Factory: Builds a unified EngineFrame from various sources (Rule 608 context assembly).
   * This is the ONLY place that should perform the "Lookup Ladder" for legacy/scattered data.
   */
  public static createEngineFrame(state: GameState, options: BaseResolveInputs): EngineFrame {
    const {
      sourceId,
      stackObject,
      parentContext,
      controllerIdOverride,
      lookingCards,
      lastMilledIds,
      lastDiscardedIds,
    } = options;

    const transient: any = stackObject || {};

    // Source Resolution: Find the object responsible for this frame
    const sourceObj =
      this.findObject(state, sourceId, stackObject, parentContext, lookingCards) ||
      stackObject?.sourceObject ||
      stackObject;

    const controllerId =
      (controllerIdOverride || (sourceObj as GameObject)?.controllerId || state.activePlayerId) as PlayerId;

    const targets = options.targets || options.validTargetIds || [];

    return {
      castFromZone: transient.castFromZone || stackObject?.castFromZone || parentContext?.castFromZone,
      controllerId,
      effectIndex: options.effectIndex ?? (options.effects ? 0 : stackObject?.effectIndex ?? 0),
      isResumption: options.isResumption ?? false,
      discardAmount: transient.discardAmount || stackObject?.discardAmount || parentContext?.discardAmount,
      effects: options.effects || stackObject?.effects || [],
      event: stackObject?.event || parentContext?.event,
      eventAmount: transient.eventAmount || stackObject?.eventAmount || parentContext?.eventAmount,
      exiledIds: transient.exiledIds || stackObject?.exiledIds,
      isCopy: transient.isCopy || stackObject?.isCopy || parentContext?.isCopy,
      isFreeCast: transient.isFreeCast ?? stackObject?.isFreeCast ?? parentContext?.isFreeCast,
      paidManaValue: transient.paidManaValue ?? stackObject?.paidManaValue ?? parentContext?.paidManaValue,
      exileOnResolution: options.exileOnResolution ?? transient.exileOnResolution ?? stackObject?.exileOnResolution ?? parentContext?.exileOnResolution,
      lastDiscardedIds: lastDiscardedIds || transient.lastDiscardedIds || stackObject?.lastDiscardedIds || parentContext?.lastDiscardedIds,
      lastMilledIds: lastMilledIds || transient.lastMilledIds || stackObject?.lastMilledIds || parentContext?.lastMilledIds,
      lookingCards: (lookingCards || transient.lookingCards || stackObject?.lookingCards || parentContext?.lookingCards) as GameObject[],
      maxChoices: transient.maxChoices ?? stackObject?.maxChoices ?? parentContext?.maxChoices,
      minChoices: transient.minChoices ?? stackObject?.minChoices ?? parentContext?.minChoices,
      nextPlayerIds: transient.nextPlayerIds || stackObject?.nextPlayerIds || parentContext?.nextPlayerIds,
      onFailureEffects: transient.onFailureEffects || stackObject?.onFailureEffects || parentContext?.onFailureEffects,
      parentContext,
      sourceId,
      sourceName: transient.sourceName || stackObject?.sourceName || parentContext?.sourceName,
      sourceObject: (sourceObj as GameObject),
      stackObject,
      targets,
      xValue: transient.xValue ?? stackObject?.xValue ?? parentContext?.xValue,
    };
  }

  /**
   * Main entry point for resolving a list of effects.
   */
  public static getEffectHandler(type: EffectType | string) {
    return EffectRegistry[type];
  }

  public static resolveEffects(options: ResolveEffectsOptions): boolean {
    const { state, context, skipFizzleCheck } = options;
    const { effects, sourceId, targets, stackObject, parentContext } = context;
    const { logger } = getProcessors(state);

    const startIndex = context.effectIndex ?? 0;
    // Clone effects to prevent permanent modification of the source array (e.g. stackObject.effects)
    // when injecting sub-effects like SearchLibrary or conditional follow-ups.
    const activeEffects = [...effects];
    context.effects = activeEffects;

    logger.debug(state, LogCategory.ACTION, `[RESOLVE-EFFECTS] Resolving ${activeEffects.length} effect(s) from source ${sourceId}. StartIndex: ${startIndex}. isResumption: ${context.isResumption}. Targets: ${targets.join(', ')}`);

    // Ensure transient tracking arrays are initialized so shallow copies share the same reference (CR 608)
    if (!context.exiledIds) context.exiledIds = (stackObject?.exiledIds || []);
    if (!context.lastMilledIds) context.lastMilledIds = (stackObject?.lastMilledIds || []);
    if (!context.lastDiscardedIds) context.lastDiscardedIds = (stackObject?.lastDiscardedIds || []);
    if (!context.lookingCards) context.lookingCards = (stackObject?.lookingCards || []);

    // CR 608.2b: Check target legality on resolution (Fizzle check)
    // Only check at the very beginning of the original resolution sequence
    if (startIndex === 0 && !context.isResumption && !parentContext && !skipFizzleCheck && targets.length > 0 && activeEffects.some(e => {
      const tm = (e.targetMapping || "").toString();
      return tm.startsWith('TARGET_') || tm === TargetMapping.TargetOpponent || tm === TargetMapping.TargetPlayer;
    })) {
      const { targeting: TP } = getProcessors(state);

      const fizzle = TP.shouldFizzle(state, context, targets, activeEffects);

      if (fizzle) {
        logger.info(state, LogCategory.ACTION, `[FIZZLE] ${stackObject?.sourceObject?.definition.name || "Spell"}: All targets have become illegal.`);
        return true; // Return true as fully resolved (but fizzled)
      }
    }

    for (let i = startIndex; i < activeEffects.length; i++) {
      const effect = activeEffects[i];
      logger.info(state, LogCategory.ACTION, `[RESOLVE-LOOP] ${i}/${activeEffects.length}: Type=${effect.type} Source=${sourceId}`);

      // CR 608.2: We will update the effectIndex AFTER successful execution or during suspension handling.
      // This ensures that if an effect suspends, it resumes at the CORRECT index.

      this.executeEffect({
        state,
        context,
        effect
      });

      // Update the effectIndex AFTER execution (CR 608.2)
      context.effectIndex = i + 1;
      if (stackObject && stackObject.effects === effects) {
        stackObject.effectIndex = i + 1;
      }

      // Update lookingCards in the context if it was modified during execution (for remainder effects)
      if (state.pendingAction?.data?.metadata?.lookingCards) {
        context.lookingCards = state.pendingAction.data.metadata.lookingCards;
      }

      if (state.pendingAction) {
        logger.debug(state, LogCategory.ACTION, `[RESOLVE-EFFECTS] Suspension detected at index ${i}. PendingAction: ${state.pendingAction.type} for ${state.pendingAction.sourceId}. Expected SourceId: ${sourceId}`);

        if (stackObject) {
          stackObject.effectIndex = context.effectIndex;
          stackObject.lookingCards = context.lookingCards;
          stackObject.lastMilledIds = context.lastMilledIds;
          stackObject.lastDiscardedIds = context.lastDiscardedIds;
          stackObject.discardAmount = context.discardAmount;
          stackObject.xValue = context.xValue;
          stackObject.exileOnResolution = context.exileOnResolution;
          stackObject.chosenName = context.chosenName;
        }

        // Rule 603.3: Prune the stored objects to avoid recursion depth and circular references in sockets.
        const slimStackObj = this.slimStackObj(state, stackObject);

        if (
          state.pendingAction.data?.stackObj &&
          state.pendingAction.data?.effects
        ) {
          // If we already have a suspended state, do not overwrite it.
          return false;
        }

        // If the pending action was created by a sub-effect for a DIFFERENT object
        // (e.g. CastSpell created targeting for the sub-spell), don't overwrite it.
        // EXCEPT for spell copies, where the mismatch is intentional for re-targeting.
        const pendingMeta = getActionMeta(state.pendingAction);
        if (state.pendingAction.sourceId && state.pendingAction.sourceId !== sourceId && !pendingMeta.isCopyTargeting) {
          logger.debug(state, LogCategory.ACTION, `[RESOLVE-EFFECTS] SourceId mismatch, skipping injection. PendingSource: ${state.pendingAction.sourceId}, ResolvedSource: ${sourceId}`);
          return false;
        }

        logger.info(state, LogCategory.ACTION, `[RESOLVE-EFFECTS] Injecting ${activeEffects.length - (i + 1)} remaining effects into ${state.pendingAction.type} for ${sourceId}. Next Index: ${i + 1}`);

        const existingData = (state.pendingAction.data || {}) as import('@shared/engine_types').BaseActionData;

        // Build metadata container for EngineFrame persistence
        const metadata: import('@shared/engine_types').InteractionMetadata = {
          ...context,
          ...(existingData.metadata || {}),
          effects: context.effects.map((e) => ({ ...e })),
          effectIndex: context.effectIndex,
          isResumption: true,
          parentContext: pruneContext(parentContext),
          stackObj: slimStackObj || undefined,
        };

        state.pendingAction.data = {
          ...existingData,
          label: existingData.label || "Resolution",
          metadata
        };
        state.priorityPlayerId = state.pendingAction.playerId;
        return false;
      }
    }
    if (stackObject) {
      stackObject.effectIndex = effects.length;
    }

    return true;
  }

  private static slimStackObj(state: GameState, stackObject: StackObject | undefined): StackObject | undefined {
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
        ...stackObject,
        id: stackObject.id,
        name: name,
        image_url: imageUrl,
        type: stackObject.type,
        sourceId: stackObject.sourceId,
        controllerId: stackObject.controllerId,
        definition: source?.definition, // Pass the definition for clean rendering
        targets: stackObject.targets || [],
        targetsControllers: stackObject.targetsControllers,
        summary: stackObject.summary,
        data: stackObject.data, // Preserve legacy data for UI components still using it
      } as unknown as StackObject;
    }
    return undefined;
  }

  public static executeEffect(options: EffectExecutionOptions) {
    const { state, context, effect } = options;
    const { sourceId, stackObject, controllerId, targets } = context;
    const { logger, targeting: TP } = getProcessors(state);

    logger.info(state, LogCategory.ACTION, `[EXECUTE-EFFECT] Type=${effect.type} Source=${sourceId} Controller=${controllerId} Targets=${targets.join(', ')}`);


    // Rule 608.2: Evaluate conditions
    if (effect.condition) {
      const met = this.checkCondition(state, effect.condition, context);
      if (!met) {
        if (effect.onFailureEffects) {
          return this.resolveEffects({
            state,
            context: this.createEngineFrame(state, {
              sourceId,
              effects: effect.onFailureEffects,
              targets,
              stackObject,
              parentContext: context,
            })
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

      // System effects (Choice, Delayed Triggers, Continuous Effects, Conditional) should inherit parent targets if no mapping is specified
      const inheritsTargets = (
        [
          EffectType.Choice,
          EffectType.CreateDelayedTrigger,
          EffectType.ApplyContinuousEffect,
          EffectType.ConditionalEffect,
        ] as string[]
      ).includes(effect.type);

      if (inheritsTargets && (!m || m === "") && ids.length === 0) {
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
          EffectType.CreateTokenCopy,
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

    // CR 608.2b: Merge all resolved targets for handlers that require multiple participants (e.g. Fight)
    const allResolvedTargets = [...validTargetIds, ...validTarget2Ids];

    // CR 608.2b: Legality check moved to resolveEffects to prevent middle-of-resolution fizzling
    // (e.g. when an effect moves its own target, like Destroy)

    if (
      (effect.targetMapping &&
        validTargetIds.length === 0 &&
        !effect.targetIds?.length &&
        !effect.targetDefinitions) ||
      (effect.target2Mapping &&
        validTarget2Ids.length === 0 &&
        !effect.targetDefinitions)
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
      effect.targetDefinitions &&
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
        context.parentContext,
      );
    }

    // Registry Dispatcher
    const handler = EffectRegistry[effect.type];
    if (handler) {
      return handler.handle(state, effect, {
        ...context,
        targets: allResolvedTargets,
        originalTargets: targets, // Preserve original targets for secondary mapping resolution
      });
    } else {
      if (effect.targetMapping && effect.targetMapping !== "") {
      logger.warn(state, LogCategory.TARGETING, `[TARGET-MAP-WARN] No handler registered for mapping: ${effect.targetMapping}`);
    }
    return [];
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
    context: EngineFrame,
    validationIndex: number = 0,
  ): string[] {
    const { sourceId, stackObject, parentContext } = context;
    return ids.filter((tid, index) => {
      if (!tid) return false;
      if (state.players[tid as PlayerId]) return true;
      const obj = this.findObject(state, tid, stackObject, context, context.lookingCards);
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

      if ([TargetMapping.SelectedCard as string, TargetMapping.EventTarget as string].includes(effect.targetMapping as string))
        return true;
      const targetDefinitions =
        effect.targetDefinitions ||
        (stackObject || parentContext?.stackObject)?.targetDefinitions;
      if (!targetDefinitions) return true;

      const { targeting: TP } = getProcessors(state);
      return TP.isLegalTarget(
        state,
        {
          sourceId,
          controllerId: context.controllerId,
          stackObject,
          targetDefinitions,
          targetIndex: validationIndex !== undefined ? validationIndex : index,
          effects: [],
          targets: []
        },
        tid,
      );
    });
  }

  private static checkCondition(
    state: GameState,
    condition: ConditionType,
    context: EngineFrame,
  ): boolean {
    const { condition: CP } = getProcessors(state);
    return CP.matchesCondition(state, condition, context);
  }

  public static resolveAmount(
    state: GameState,
    amount: NumericProperty,
    context: EngineFrame,
    targetIds: string[] = [],
  ): number {
    return RuleUtils.resolveAmount(state, amount, { ...context, targets: targetIds });
  }

  public static findObject(
    state: GameState,
    id: string,
    stackObject?: StackObject,
    parentContext?: EngineFrame,
    lookingCards?: GameObject[]
  ): Targetable | undefined {
    // Priority 1: LKI Snapshot (Rule 608.2h)
    const processors = getProcessors(state);
    const snapshot = processors.lki.getLki(state, id);
    if (snapshot && snapshot.id === id) return snapshot;

    return (
      RuleUtils.findObject(state, id) ||
      (lookingCards as GameObject[])?.find((o) => o.id === id) ||
      ((state.pendingAction?.data as { lookingCards?: GameObject[] })?.lookingCards)?.find(
        (o) => o.id === id,
      ) ||
      (parentContext?.lookingCards as GameObject[])?.find((o) => o.id === id) ||
      (stackObject?.lookingCards as GameObject[])?.find((o) => o.id === id)
    );
  }

  private static resolveInteractiveEffectSelection(
    state: GameState,
    effect: EffectDefinition,
    sourceId: string,
    controllerId: PlayerId,
    stackObject?: StackObject,
    parentContext?: EngineFrame,
  ) {
    const { choiceGenerator: ChoiceGenerator, targeting: TP, logger } = getProcessors(state);
    const targetDefinitions = effect.targetDefinitions || [];
    const firstDef = targetDefinitions[0];
    if (!firstDef) return;

    const player = state.players[controllerId];
    if (!player) return;

    let pool: GameObject[] = [];
    const expectedZone = firstDef.zone;

    if (expectedZone === Zone.Hand || firstDef.type === TargetType.CardInHand) {
      pool = player.hand;
    } else if (expectedZone === Zone.Graveyard || firstDef.type === TargetType.CardInGraveyard) {
      pool = Object.values(state.players).flatMap((p) => p.graveyard);
    } else if (expectedZone === Zone.Library || firstDef.type === TargetType.CardInLibrary) {
      pool = player.library;
    } else if (
      expectedZone === Zone.Battlefield ||
      firstDef.type === TargetType.Permanent ||
      (firstDef.type as string).toLowerCase().includes("permanent") ||
      (firstDef.type as string).toLowerCase() === "nonland" ||
      (firstDef.type as string).toLowerCase().includes("creature") ||
      (firstDef.type as string).toLowerCase().includes("planeswalker") ||
      (firstDef.type as string).toLowerCase().includes("artifact") ||
      (firstDef.type as string).toLowerCase().includes("enchantment")
    ) {
      pool = state.battlefield;
    } else {
      // Fallback for general cards or spells across all visible zones
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
      ...getRestrictions(firstDef),
    ];

    const xValueToUse = stackObject?.xValue ?? parentContext?.xValue;
    logger.info(state, LogCategory.ACTION, `[RESOLVE-INTERACTIVE] Starting selection for ${sourceId}. xValue: ${xValueToUse}, stackObj.xValue: ${stackObject?.xValue}, parentContext.xValue: ${parentContext?.xValue}`);

    const validCandidates = pool.filter((c) => {
      const isLegal = TP.isLegalTarget(
        state,
        {
          sourceId,
          controllerId,
          stackObject,
          targetDefinitions: effect.targetDefinitions || [],
          targetIndex: 0,
          xValue: xValueToUse,
          effects: [],
          targets: []
        },
        c.id
      );
      if (!isLegal) {
        const mv = ManaProcessor.getEffectiveManaValue(c);
        logger.info(state, LogCategory.ACTION, `[RESOLVE-INTERACTIVE-DEBUG] Card ${c.definition.name} (MV=${mv}) is NOT legal. Zone=${c.zone}`);
      }
      return isLegal;
    });

    logger.info(state, LogCategory.ACTION, `[RESOLVE-INTERACTIVE] Found ${validCandidates.length} valid candidates for ${sourceId} from pool of ${pool.length}. ExpectedZone: ${expectedZone}`);

    if (validCandidates.length === 0) {
      logger.info(state, LogCategory.ACTION, `[INFO] EffectProcessor: No valid targets for interactive selection. Skipping.`);
      return;
    }

    const resolvedContext: EngineFrame = {
      sourceId,
      controllerId,
      targets: [],
      effects: [effect],
      stackObject,
    };
    const resolvedMax = this.resolveAmount(
      state,
      firstDef.count as unknown as number || 1,
      resolvedContext,
    );
    const resolvedMin =
      firstDef.minCount !== undefined
        ? this.resolveAmount(state, firstDef.minCount, resolvedContext)
        : firstDef.optional
          ? 0
          : resolvedMax;

    const isBattlefieldTarget = (expectedZone === undefined || expectedZone === Zone.Battlefield) && [
      TargetType.Permanent,
      TargetType.Creature,
      TargetType.Artifact,
      TargetType.Enchantment,
      TargetType.Planeswalker,
      TargetType.Land,
      TargetType.AnyTarget,
      TargetType.Player,
      TargetType.Opponent,
    ].some(t => String(firstDef.type).toUpperCase().includes(String(t).toUpperCase()));

    if (isBattlefieldTarget) {
      state.pendingAction = {
        type: ActionType.Targeting,
        playerId: controllerId,
        sourceId: sourceId,
        data: {
          label: effect.label || `Choose target for ${sourceId}`,
          metadata: {
            stackObj: EffectProcessor.slimStackObj(state, stackObject),
            parentContext: pruneContext(parentContext),
            xValue: stackObject?.xValue,
            exileOnResolution: stackObject?.exileOnResolution ?? parentContext?.exileOnResolution
          },
          targetDefinitions: effect.targetDefinitions || [],
          targets: validCandidates.map(c => c.id),
          effectIndex: parentContext?.effectIndex,
          effects: parentContext?.effects || [effect],
          stackObj: stackObject, // Legal in BaseActionData
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
      optional: firstDef.optional || effect.optional || resolvedMin === 0,
      minChoices: resolvedMin,
      maxChoices: resolvedMax,
      stackObj: EffectProcessor.slimStackObj(state, stackObject),
      exileOnResolution: stackObject?.exileOnResolution ?? parentContext?.exileOnResolution,
      actionType:
        firstDef.optional || effect.optional || resolvedMin === 0
          ? ActionType.OptionalAction
          : ActionType.ResolutionChoice,
      onSelected: (selected: GameObject | GameObject[]) => {
        const selectedIds = Array.isArray(selected)
          ? selected.map((s) => s.id)
          : [selected.id];

        return [
          {
            ...effect,
            targetDefinitions: undefined, // Clear to avoid re-triggering interactive loop
            targetMapping: undefined,
            targetIds: selectedIds,
          },
        ];
      },
      onNone: () => [],
      parentContext: pruneContext(parentContext),
    });
  }
}

