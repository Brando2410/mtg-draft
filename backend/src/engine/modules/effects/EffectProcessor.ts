import {
  ActionType,
  ConditionType, DurationType,
  EffectDefinition,
  EffectType, GameObject, GameState, PlayerId,
  ResolutionContext, TargetMapping, TargetType, Zone,
  StackObject,
  TriggerEvent,
  TargetDefinition
} from "@shared/engine_types";
import {
  EffectExecutionOptions
} from "../../interfaces/EngineContext";
import { EffectRegistry } from "./EffectRegistry";
import { Targetable } from "@shared/types/targeting";

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
  log: (m: string) => void;
  startIndex?: number;
  stackObject?: StackObject;
  parentContext?: ResolutionContext;
  controllerIdOverride?: PlayerId;
  lookingCards?: GameObject[];
}

export class EffectProcessor {
  public static resolveEffects(options: ResolveEffectsOptions): boolean {
    const {
      state,
      effects,
      sourceId,
      targets,
      log,
      startIndex = 0,
      stackObject,
      parentContext,
      controllerIdOverride,
      lookingCards
    } = options;

    // CR 608.2b: Check target legality on resolution (Fizzle check)
    // MTG Rule: The check is made once as the spell or ability starts to resolve from the stack.
    // If all its targets are now illegal, the spell or ability is countered.
    // We only run this on the ROOT resolution (parentContext === null) to avoid nested sub-effects triggering it.
    if (startIndex === 0 && !parentContext && targets.length > 0 && effects.some(e => e.targetMapping?.toString().startsWith('TARGET_'))) {
      const { TargetingProcessor: TP } = require('../actions/targeting/TargetingProcessor');
      const legalTargets = targets.filter(tid => {
        // We use the first effect's target definition as a proxy for the spell's targeting requirements
        const isLegal = TP.isLegalTarget(state, {
          sourceId,
          controllerId: controllerIdOverride || state.activePlayerId,
          stackObject,
          targetDef: effects[0].targetDefinition || stackObject?.data?.targetDefinition
        }, tid);
        return isLegal;
      });

      if (legalTargets.length === 0) {
        log(`[FIZZLE] ${stackObject?.card?.definition.name || "Spell"}: All targets have become illegal.`);
        return true; // Return true as fully resolved (but fizzled)
      }
    }

    for (let i = startIndex; i < effects.length; i++) {
      const effect = effects[i];
      if (log) log(`[DEBUG] EffectProcessor: Executing effect ${i}/${effects.length}: ${effect.type}. Targets: ${JSON.stringify(targets)}`);

      this.executeEffect({
        state,
        effect,
        sourceId,
        validTargetIds: targets, // Note: targets here is the initial set, executeEffect resolves mappings
        log,
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

      const { TargetingProcessor } = require("./../actions/targeting/TargetingProcessor");
      const source = TargetingProcessor.findObjectInAnyZone(
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
      log,
      stackObject,
      parentContext,
      controllerIdOverride,
    } = options;
    const targets = options.validTargetIds || [];

    const sourceObj =
      this.findObject(state, sourceId, stackObject, parentContext) ||
      (stackObject?.card ? stackObject.card : stackObject);
    const controllerId =
      (controllerIdOverride || (sourceObj as GameObject)?.controllerId || state.activePlayerId) as PlayerId;
    const { TargetingProcessor } = require("../actions/targeting/TargetingProcessor");

    // Create a ResolutionContext for handlers that expect it
    const context: ResolutionContext = {
      sourceId,
      controllerId,
      targets,
      effects: stackObject?.data?.effects || [effect],
      stackObject,
      parentContext,
      startIndex: stackObject?.data?.startIndex || 0,
      event: stackObject?.data?.eventData,
      exiledIds: stackObject?.data?.exiledIds,
      lookingCards: (stackObject?.data?.lookingCards || parentContext?.lookingCards) as GameObject[],
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
            log,
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
      const ids = TargetingProcessor.resolveTargetMapping(
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
      const isDirectTargetMapping =
        mStr.startsWith("TARGET_") &&
        !isNaN(parseInt(mStr.substring(7))) &&
        mStr.split("_").length === 2;

      let validationIndex = index;
      if (isDirectTargetMapping) {
        validationIndex = parseInt(mStr.substring(7)) - 1;
      }

      if (
        isDirectTargetMapping ||
        (
          [
            TargetMapping.TargetOpponent,
            TargetMapping.TargetPlayer,
            TargetMapping.TargetCreature,
            TargetMapping.TargetPermanent,
          ] as string[]
        ).includes(mStr)
      ) {
        return this.getValidTargetIds(
          state,
          effect,
          ids,
          context,
          validationIndex,
        );
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
        log,
        stackObject,
        parentContext,
      );
    }

    // Registry Dispatcher
    const handler = EffectRegistry[effect.type];
    if (handler) {
      return handler.handle(state, effect, log, {
        ...context,
        targets: validTargetIds,
      });
    }

    // Strategy Dispatcher (Legacy) - DEPRECATED: All effects now use the Registry
    if (!EffectRegistry[effect.type]) {
      log(`[WARNING] Unknown/Unregistered effect type: ${effect.type}`);
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

      const { TargetingProcessor } = require("../actions/targeting/TargetingProcessor");
      return TargetingProcessor.isLegalTarget(
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
    const { ConditionProcessor } = require("../core/logic/ConditionProcessor");
    const { sourceId, controllerId, targets, stackObject } = context;

    // We wrap the stackObject/parent state into a clean ConditionContext
    const extendedEvent = { ...(stackObject || {}), targets };

    return ConditionProcessor.matchesCondition(state, condition, {
      sourceId,
      controllerId,
      event: extendedEvent as unknown as TriggerEvent,
      stackObject,
      targets,
    });
  }

  public static resolveAmount(
    state: GameState,
    amount: number | string | ((...args: any[]) => number) | undefined,
    context: ResolutionContext,
    targetIds: string[] = [],
  ): number {
    const { sourceId, controllerId, stackObject, parentContext } = context;
    if (amount === undefined) return 0;
    if (typeof amount === "number") {
      // LEGACY: -1 represents last damage amount in some old card definitions
      return amount === -1 ? state.turnState.lastDamageAmount || 0 : amount;
    }
    if (typeof amount === "string" && !isNaN(Number(amount))) return Number(amount);

    // Keywords for specific selection modes
    if (typeof amount === "string" && ["ANY", "ALL", "Any", "All"].includes(amount)) {
      return amount as unknown as number;
    }

    // Dynamic counter lookups
    if (typeof amount === "string" && amount.startsWith("SOURCE_COUNTERS:")) {
      const counterType = amount.split(":")[1];
      const source = state.battlefield.find((o) => o.id === sourceId);
      return source?.counters[counterType] || 0;
    }

    // Function injection support
    if (typeof amount === "function") {
      return amount(
        state,
        this.findObject(state, sourceId, stackObject) || { id: sourceId, controllerId },
        targetIds,
        stackObject,
      );
    }

    const obj = this.findObject(state, sourceId, stackObject) as GameObject;
    let result = 0;

    switch (amount) {
      case "POWER":
        result = obj?.effectiveStats?.power ?? Number(obj?.definition?.power || 0);
        break;
      case "TOUGHNESS":
        result = obj?.effectiveStats?.toughness ?? Number(obj?.definition?.toughness || 0);
        break;
      case "X":
        result =
          stackObject?.xValue ??
          stackObject?.data?.event?.payload?.stackSnapshot?.xValue ??
          stackObject?.data?.eventData?.payload?.stackSnapshot?.xValue ??
          stackObject?.data?.event?.payload?.object?.xValue ??
          stackObject?.data?.eventData?.payload?.object?.xValue ??
          stackObject?.data?.eventData?.xValue ??
          parentContext?.event?.payload?.stackSnapshot?.xValue ??
          parentContext?.event?.payload?.object?.xValue ??
          stackObject?.data?.xValue ??
          0;
        break;
      case "X_PLUS_1":
        result = (stackObject?.xValue || 0) + 1;
        break;
      case "X_POWER_OF_2":
      case "2_POW_X":
        result = Math.pow(2, stackObject?.xValue || 0);
        break;
      case "GRAVEYARD_SIZE":
        result = state.players[controllerId]?.graveyard.length || 0;
        break;
      case "GRAVEYARD_SIZE_NEGATIVE":
        result = -(state.players[controllerId]?.graveyard.length || 0);
        break;
      case "HAND_SIZE":
      case "CARDS_IN_HAND_COUNT":
        result = state.players[controllerId]?.hand.length || 0;
        break;
      case "TARGET_1_HAND_SIZE": {
        const tid = stackObject?.targets?.[0] || targetIds[0];
        const pid = tid as PlayerId;
        result = state.players[pid]?.hand.length || 0;
        break;
      }
      case "OTHER_ATTACKING_CREATURES_COUNT":
        result = state.battlefield.filter((p) => p.isAttacking && p.id !== sourceId).length;
        break;
      case "EVENT_OBJECT_POWER":
      case "EVENT_OBJECT_TOUGHNESS": {
        const eObj = stackObject?.data?.eventData?.payload?.object || parentContext?.event?.payload?.object;
        if (eObj) {
          const { LayerProcessor } = require("./../state/LayerProcessor");
          const stats = LayerProcessor.getEffectiveStats(eObj, state);
          result = amount === "EVENT_OBJECT_POWER" ? stats.power : stats.toughness;
        }
        break;
      }
      case "TARGET_1_POWER":
      case "TARGET_1_TOUGHNESS": {
        const tid = stackObject?.targets?.[0] || targetIds[0];
        const tObj = state.battlefield.find((o) => o.id === tid) || state.turnState.creaturesDiedThisTurn.find((o) => o.id === tid) || Object.values(state.players).flatMap(p => p.graveyard).find(o => o.id === tid);
        if (tObj) {
          const { LayerProcessor } = require("./../state/LayerProcessor");
          const stats = LayerProcessor.getEffectiveStats(tObj, state);
          result = amount === "TARGET_1_POWER" ? stats.power : stats.toughness;
        }
        break;
      }
      case "DESTROYED_COUNT":
        result = state.turnState.lastDestroyedCount || 0;
        break;
      case "DISCARDED_COUNT":
        result = state.turnState.lastDiscardedCount || 0;
        break;
      case "DISCARDED_COUNT_PLUS_1":
        result = (state.turnState.lastDiscardedCount || 0) + 1;
        break;
      case "CARDS_DRAWN_THIS_TURN":
        result = state.turnState.cardsDrawnThisTurn?.[controllerId] || 0;
        break;
      case "GAINED_LIFE_AMOUNT":
        result = state.turnState.lifeGainedThisTurn?.[controllerId] || 0;
        break;
      case "NONCOMBAT_DAMAGE_DEALT_OPPONENTS_THIS_TURN":
        result = state.turnState.noncombatDamageDealtToOpponents?.[controllerId] || 0;
        break;
      case "CONVERGE_AMOUNT":
        result =
          stackObject?.convergeAmount ??
          stackObject?.card?.convergeAmount ??
          stackObject?.data?.eventData?.payload?.card?.convergeAmount ??
          stackObject?.data?.convergeAmount ??
          0;
        break;
      case "CAPTURED_AMOUNT":
        result = stackObject?.data?.amount || stackObject?.data?.capturedMV || 0;
        break;
      case "INSTANTS_SORCERIES_IN_GRAVEYARD":
      case "INSTANT_SORCERY_IN_GRAVEYARD_COUNT": {
        const gy = state.players[controllerId]?.graveyard || [];
        result = gy.filter((c) => {
          const types = (c.definition.types || []).map((t) => t.toLowerCase());
          return types.includes("instant") || types.includes("sorcery");
        }).length;
        break;
      }
      case "FRANTIC_INVENTORY_COUNT": {
        const gy = state.players[controllerId]?.graveyard || [];
        result = gy.filter((c) => c.definition.name === "Frantic Inventory").length;
        break;
      }
      case "EVENT_AMOUNT":
        result =
          stackObject?.data?.eventAmount ??
          stackObject?.data?.eventData?.spent ??
          stackObject?.data?.eventData?.payload?.card?.paidManaValue ??
          state.turnState.lastDamageAmount ??
          0;
        break;
      case "SACRIFICED_OBJECT_POWER": {
        const lastSac = state.turnState.lastSacrificedObject;
        result = lastSac?.effectiveStats?.power || Number(lastSac?.definition.power || 0);
        break;
      }
      case "EVENT_PAID_MANA": {
        const pObj = stackObject?.data?.object || stackObject?.card;
        result = (pObj as GameObject)?.paidManaValue || stackObject?.data?.card?.paidManaValue || 0;
        break;
      }
      case "TARGET_1_MANA_VALUE": {
        const { ManaProcessor } = require("../magic/ManaProcessor");
        const tId = stackObject?.targets?.[0] || targetIds[0];
        const mObj = this.findObject(state, tId, stackObject, parentContext) as GameObject;
        result = mObj ? ManaProcessor.getManaValue(mObj.definition.manaCost) : 0;
        break;
      }
      case "TARGET_1_COUNTERS_P1P1": {
        const tId = stackObject?.targets?.[0] || targetIds[0];
        const cObj = state.battlefield.find((o) => o.id === tId);
        result = (cObj?.counters?.["p1p1"] || 0) + (cObj?.counters?.["+1/+1"] || 0);
        break;
      }
      case "CREATURE_COUNT_YOU_CONTROL":
      case "CREATURES_YOU_CONTROL":
        result = state.battlefield.filter(
          (o) => o.controllerId === controllerId && o.definition.types.some((t) => t.toLowerCase() === "creature"),
        ).length;
        break;
      case "TARGET_HAND_SIZE_7_MINUS": {
        const tId = stackObject?.targets?.[0];
        const tObj = state.battlefield.find((o) => o.id === tId);
        const hSize = state.players[tObj?.controllerId as PlayerId]?.hand.length || 0;
        result = -(7 - hSize);
        break;
      }
      case "TARGET_1_GRAVEYARD_CREATURE_COUNT_X2": {
        const tid = stackObject?.targets?.[0] || targetIds[0];
        const pid = tid as PlayerId;
        const gy = state.players[pid]?.graveyard || [];
        result = gy.filter((c) => (c.definition.types || []).some((t) => t.toLowerCase() === "creature")).length * 2;
        break;
      }
      case "GRAVEYARD_NAME_COUNT_PLUS_1": {
        const gy = state.players[controllerId]?.graveyard || [];
        const name = obj?.definition?.name;
        result = gy.filter((c) => c.definition.name === name).length + 1;
        break;
      }
      default:
        result = 0;
    }

    return result;
  }

  public static findObject(
    state: GameState,
    id: string,
    stackObject?: StackObject,
    parentContext?: ResolutionContext,
  ): Targetable | undefined {
    // Priority 1: Trigger snapshot (for leaves-battlefield triggers like Star Pupil)
    const snapshot = stackObject?.data?.eventData?.payload?.object as GameObject | undefined;
    if (snapshot && snapshot.id === id) return snapshot;

    return (
      state.battlefield.find((o) => o.id === id) ||
      state.stack.find((s) => s.id === id || s.sourceId === id)?.card ||
      Object.values(state.players)
        .flatMap((p) => [...p.graveyard, ...p.hand, ...p.library])
        .find((o) => o.id === id) ||
      state.exile.find((o) => o.id === id) ||
      state.limbo?.find((o) => o.id === id) ||
      (stackObject?.card?.id === id ? stackObject?.card : undefined) ||
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
    log: (m: string) => void,
    stackObject?: StackObject,
    parentContext?: ResolutionContext,
  ) {
    const { ChoiceGenerator } = require("./ChoiceGenerator");
    const { TargetingProcessor } = require("../actions/targeting/TargetingProcessor");
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
      TargetingProcessor.matchesRestrictions(
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
      log(`[INFO] EffectProcessor: No valid targets for interactive selection. Skipping.`);
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
      log(`[TARGETING] Prompting for battlefield targeting for effect resolution...`);
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
