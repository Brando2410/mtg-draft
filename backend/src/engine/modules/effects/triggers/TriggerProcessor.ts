import {
  AbilityType,
  ActionType,
  ConditionType,
  CostType,
  DurationType,
  EffectType,
  GameEvent,
  GameObjectId,
  GameState,
  PlayerId,
  Restriction,
  StackObject,
  TargetMapping,
  TriggeredAbility,
  TriggeredAbilityDefinition,
  AbilityDefinition,
  TriggerEvent,
  Zone
} from "@shared/engine_types";
import { LogCategory } from "../../../utils/EngineLogger";
import { RuleUtils } from "../../../utils/RuleUtils";
import { oracle } from "../../../OracleLogicMap";
import { getProcessors } from "../../ProcessorRegistry";
import { LayerProcessor } from "../../state/LayerProcessor";
import { Profiler } from "../../../utils/Profiler";

/**
 * Rules Engine Module: Triggered Abilities (Rule 603)
 * Monitors game events and handles placing triggers on the stack.
 */
export class TriggerProcessor {
  /**
   * Main entry point for any game event (LifeGain, ETB, Death, etc.)
   * Rule 603.3: "Once an ability has triggered, its controller puts it on the stack..."
   */
  public static onEvent(
    state: GameState,
    event: GameEvent,
  ) {
    Profiler.start('trigger.check');
    try {
      const { logger } = getProcessors(state);
      if (event.type === TriggerEvent.ResolveSpell || event.type === TriggerEvent.PreCombatMainPhaseStart || event.type === TriggerEvent.EndStep) {
        logger.debug(state, LogCategory.TRIGGER, `Processing event: ${event.type}`);
      }
      // 1. Identify all triggered abilities that match this event (Rule 603.2)
      const matchingTriggers = this.collectMatchingTriggers(state, event);

      // 2. Process system-recognized keywords (Prowess, Ward, etc.)
      this.processSystemKeywords(state, event, matchingTriggers);

      if (matchingTriggers.length === 0) return;

      // --- DEDUPLICATION (Fix for Issue #2: prevents multiple triggers for the same ability instance) ---
      // We use a composite key of sourceId + ability name (or type) to ensure we don't fire the same thing twice for one card.
      const uniqueTriggersMap = new Map<string, any>();
      matchingTriggers.forEach((t: any) => {
        const key = `${t.id || t.sourceId + "_" + ((t as any).abilityIndex || 0)}`;
        if (!uniqueTriggersMap.has(key)) {
          uniqueTriggersMap.set(key, t);
        }
      });
      const uniqueTriggers = Array.from(uniqueTriggersMap.values());

      if (uniqueTriggers.length < matchingTriggers.length) {
        logger.debug(state, LogCategory.TRIGGER, `Deduplicated ${matchingTriggers.length} triggers down to ${uniqueTriggers.length} for event ${event.type}.`);
      }

      // 2. Queue all triggers in pending state
      if (!state.pendingTriggers) state.pendingTriggers = [];

      for (const trigger of uniqueTriggers) {
        let triggerCount = 1;
        const sourceObj = RuleUtils.findObject(state, trigger.sourceId);

        // --- TRIGGER DOUBLING (CR 603.2c / 614.16) ---
        // 1. Check Replacement Effects (Standardized for specific event buckets)
        // Standard events: 'ON_TRIGGER', 'ON_SHRINE_TRIGGER' (legacy/specific)
        const triggerEvents: string[] = [TriggerEvent.OnTrigger];
        if (sourceObj && RuleUtils.hasSubtype(sourceObj, Restriction.Shrine)) {
          triggerEvents.push(TriggerEvent.OnShrineTrigger);
        }

        for (const eventName of triggerEvents) {
          const tEvent = {
            type: eventName,
            sourceId: trigger.sourceId,
            playerId: trigger.controllerId,
            data: { trigger, object: sourceObj }
          };

          const replacements = (state.ruleRegistry.replacementEffects || [])
            .filter(r => r.replacesEvent === eventName);

          for (const r of replacements) {
            const conditionMet = typeof r.condition === 'function' ? r.condition(state, tEvent, r) : true;
            if (conditionMet && r.effects?.some((e: any) => e.type === EffectType.AddAdditionalTrigger)) {
              triggerCount++;
              logger.info(state, LogCategory.TRIGGER, `[DOUBLED] ${sourceObj?.definition.name || 'Ability'} triggers an additional time via replacement effect (${eventName}).`);
            }
          }
        }

        // 2. Check Continuous Effects (Generic 'triggers an additional time' modifiers)
        const doublingEffects = state.ruleRegistry.continuousEffects.filter(e => e.type === EffectType.AddAdditionalTrigger);
        for (const eff of doublingEffects) {
          if (eff.controllerId !== trigger.controllerId) continue;

          // Check restrictions (e.g. "Whenever an artifact... triggers twice")
          if (eff.restrictions && sourceObj) {
            const { targeting: TargetingProcessor } = getProcessors(state);
            const matches = TargetingProcessor.matchesRestrictions(state, sourceObj, eff.restrictions, {
              sourceId: eff.sourceId,
              controllerId: eff.controllerId
            });
            if (!matches) continue;
          }

          triggerCount++;
          logger.info(state, LogCategory.TRIGGER, `[DOUBLED] ${sourceObj?.definition.name || 'Ability'} triggers an additional time via continuous effect.`);
        }

        for (let i = 0; i < triggerCount; i++) {
          // Increment usage (only for the first instance of a multi-trigger event)
          if (trigger.limitPerTurn && i === 0) {
            state.turnState.triggeredAbilitiesUsedThisTurn[trigger.id] =
              (state.turnState.triggeredAbilitiesUsedThisTurn[trigger.id] || 0) + 1;
          }

          const stackObj = this.createStackObject(state, trigger, event);
          logger.debug(state, LogCategory.TRIGGER, `[TRIGGER-ON-EVENT] Queuing trigger ${stackObj.id} (Source: ${trigger.sourceId}) with targets: ${stackObj.targets?.join(', ')}`);
          state.pendingTriggers.push(stackObj);

          // --- TRIGGER INTERCEPTION (Strict Proctor / Ward / etc.) ---
          // Emit ON_TRIGGER_QUEUED to allow other abilities to respond to this trigger entering the stack.
          if (event.type !== 'ON_TRIGGER_QUEUED') {
            this.onEvent(state, {
              type: 'ON_TRIGGER_QUEUED',
              playerId: trigger.controllerId,
              payload: { sourceId: stackObj.id, targetIds: [stackObj.id], object: stackObj as any, stackSnapshot: { trigger, originalEvent: event } }
            });
          }
        }
      }
      // 4. Cleanup single-shot delayed triggers (Rule 603.7)
      matchingTriggers.forEach((t: any) => {
        if ((t as any).isDelayed) {
          const startsWithUntil =
            (t as any).duration &&
            String((t as any).duration).toUpperCase().startsWith("UNTIL");
          const isOneShot = (t as any).oneShot || (t as any).firesOnce;

          if (isOneShot || !startsWithUntil) {
            state.ruleRegistry.triggeredAbilities =
              state.ruleRegistry.triggeredAbilities.filter(
                (orig) => orig.id !== t.id,
              );
          }
        }
      });
    } finally {
      Profiler.endWithThreshold('trigger.check', 10.0); // 10ms threshold for heavy trigger storms
    }
  }

  /**
   * CR 603.3b: "If multiple abilities have triggered... each player, in APNAP order,
   * puts any abilities they control on the stack in any order they choose."
   * Returns true if any triggers were put on the stack or a pending action was created.
   */
  public static processPendingTriggers(
    state: GameState,
  ): boolean {
    const { logger } = getProcessors(state);
    if (!state.pendingTriggers || state.pendingTriggers.length === 0)
      return false;

    // If an action is already pending (like ordering triggers or a modal choice), wait for it to finish.
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
        const trigger = playersTriggers[0];
        state.pendingTriggers = state.pendingTriggers.filter(
          (t) => t.id !== trigger.id,
        );
        this.stackTrigger(state, trigger);
        // Recurse to handle remaining players/triggers
        this.processPendingTriggers(state);
        return true;
      } else {
        const player = state.players[pId];
        if (player?.autoOrderTriggers) {
          // Auto-order: Just stack them in the order they arrived (arbitrary but consistent)
          for (const t of playersTriggers) {
            state.pendingTriggers = state.pendingTriggers.filter(
              (q) => q.id !== t.id,
            );
            this.stackTrigger(state, t);
          }
          this.processPendingTriggers(state);
          return true;
        }

        playersTriggers.forEach(t => {
          logger.debug(state, LogCategory.TRIGGER, `[ORDER-PENDING] Pending trigger ${t.id} has targets: ${t.targets?.join(', ')}`);
        });
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

  /**
   * Rule 603.7: Delayed Triggered Abilities
   * Created by effects during resolution. Usually triggers only once.
   */
  public static createDelayedTrigger(
    state: GameState,
    effect: any,
    sourceId: GameObjectId,
    controllerId: PlayerId,
  ) {
    const { logger } = getProcessors(state);
    const triggerId = `delayed_${sourceId}_${Date.now()}`;
    const delayedTrigger: any = {
      id: triggerId,
      sourceId,
      controllerId,
      eventMatch: effect.eventMatch,
      effects: effect.effects,
      duration: effect.duration || DurationType.UntilEndOfTurn,
      condition: effect.condition,
      data: effect.data,
      targets: effect.targets,
      isDelayed: true,
      oneShot: effect.oneShot,
      firesOnce: effect.firesOnce,
      activeZone: Zone.Any, // Virtual zone for registry (Rule 603.7)
      type: AbilityType.Triggered,
    };
    getProcessors(state).logger.debug(state, LogCategory.TRIGGER, `[DELAYED-REG] Registering trigger ${delayedTrigger.id} with targets: ${delayedTrigger.targets?.join(', ')}`);
    if (!state.ruleRegistry.triggeredAbilities)
      state.ruleRegistry.triggeredAbilities = [];
    state.ruleRegistry.triggeredAbilities.push(delayedTrigger);

    // Invalidate trigger cache
    if (state._triggerCache) state._triggerCache.version = -1;

    logger.info(state, LogCategory.TRIGGER, `[DELAYED TRIGGER] Registered: triggered on ${effect.eventMatch}.`);
  }

  public static cleanupDelayedTriggers(
    state: GameState,
  ) {
    const { logger } = getProcessors(state);
    if (!state.ruleRegistry.triggeredAbilities) return;
    const initialCount = state.ruleRegistry.triggeredAbilities.length;
    state.ruleRegistry.triggeredAbilities =
      state.ruleRegistry.triggeredAbilities.filter(
        (t) =>
          !(t as any).isDelayed || (t as any).duration !== DurationType.UntilEndOfTurn,
      );
    const removedCount =
      initialCount - state.ruleRegistry.triggeredAbilities.length;
    if (removedCount > 0) {
      logger.info(state, LogCategory.SYSTEM, `[CLEANUP] Removed ${removedCount} expired delayed triggers.`);
      // Invalidate trigger cache
      if (state._triggerCache) state._triggerCache.version = -1;
    }
  }

  private static createStackObject(
    state: GameState,
    trigger: TriggeredAbility,
    event: GameEvent,
  ): StackObject {
    const eventObj = event.payload?.object;
    const sourceObj =
      eventObj && eventObj.id === trigger.sourceId
        ? eventObj
        : RuleUtils.findObject(state, trigger.sourceId);

    const emblemSource = !sourceObj
      ? state.emblems?.find((e) => e.id === trigger.sourceId)
      : undefined;
    const sourceName =
      sourceObj?.definition.name || emblemSource?.name || "Unknown Source";
    const sourceImage =
      sourceObj?.definition.image_url || emblemSource?.image_url || trigger.payload?.image_url || (trigger as any).image_url;

    const stackId = `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    // CR 603.3: Store event snapshot for ResolutionContext (LKI)
    const contextPayload: any = {
      sourceId: trigger.sourceId,
      controllerId: trigger.controllerId,
      targets: trigger.targetIds || (trigger as any).targets || [],
      effects: trigger.effects || (trigger as any).effects || [],
      event: event,
      eventAmount: event.payload?.amount,
      targetDefinitions: (trigger as any).targetDefinitions,
      sourceName: sourceName,
      startIndex: 0
    };

    const stackObj: StackObject = {
      id: stackId,
      controllerId: trigger.controllerId,
      ownerId: sourceObj?.ownerId || trigger.controllerId,
      sourceId: trigger.sourceId,
      type: AbilityType.Triggered,
      counters: {},
      name: `${sourceName}'s Trigger`,
      targets: trigger.targetIds || (trigger as any).targets || [],
      definition: sourceObj?.definition || (trigger.payload as any)?.definition || (trigger as any).definition || { name: sourceName, types: [], colors: [], oracleText: "" },
      image_url: sourceImage,
      abilityIndex: (trigger as any).abilityIndex,
      condition: (trigger as any).condition,
      sourceObject: sourceObj || emblemSource as any,
      data: contextPayload
    };
    getProcessors(state).logger.debug(state, LogCategory.TRIGGER, `[STACK-OBJ-CREATE] Created stack object ${stackObj.id} with targets: ${stackObj.targets?.join(', ')}`);
    return stackObj;
  }

  public static stackTrigger(
    state: GameState,
    stackObj: any,
  ) {
    const { logger } = getProcessors(state);
    state.stack.push(stackObj);
    getProcessors(state).action.updateEntityCache(state, stackObj);
    state.consecutivePasses = 0;

    const targetDefinitions = stackObj.data.targetDefinitions;
    const sourceName = stackObj.data.sourceName;

    if (targetDefinitions) {
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
    targetDefinitions: any,
    sourceName: string,
    stackObj: any,
  ) {
    const { logger, targeting: TargetingProcessor } = getProcessors(state);
    const legalTargetIds = [
      ...state.battlefield.map((o: any) => o.id),
      ...(Object.values(state.players) as any[]).flatMap((p) =>
        p.graveyard.map((c: any) => c.id),
      ),
      ...state.exile.map((o: any) => o.id),
      ...state.stack.map((o: any) => o.id),
      ...Object.keys(state.players),
    ].filter((tid) =>
      TargetingProcessor.isLegalTarget(state, {
        sourceId: stackObj.sourceId,
        controllerId: stackObj.controllerId,
        stackObject: stackObj,
        targetDefinitions: targetDefinitions
      }, tid)
    );

    if (legalTargetIds.length === 0) {
      if (targetDefinitions.optional) {
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

  private static checkZone(
    state: GameState,
    trigger: TriggeredAbility,
    eventType: string,
  ): boolean {
    // Rule 603.10: "Leaves-the-battlefield" abilities look back in time.
    if (eventType === TriggerEvent.Death || eventType === TriggerEvent.LeaveBattlefield)
      return true;

    const activeZone = trigger.activeZone || Zone.Battlefield;
    if (activeZone === Zone.Any) {
      if (eventType === TriggerEvent.EndStep) {
        getProcessors(state).logger.debug(state, LogCategory.TRIGGER, `[ZONE-CHECK] Trigger ${trigger.id || 'unknown'} (Source: ${trigger.sourceId}) in Zone.Any - PASS`);
      }
      return true;
    }

    const sourceId = trigger.sourceId;

    if (trigger.isGlobal) return true;

    // CR 114: Emblem abilities function from the Command Zone (always active)
    if (activeZone === Zone.Command) {
      return state.emblems?.some((e) => e.id === sourceId) ?? false;
    }

    // Check if source object is currently in the required zone
    const isInBattlefield = state.battlefield.some((o) => o.id === sourceId);
    if (activeZone === Zone.Battlefield) return isInBattlefield;

    const isInGraveyard = Object.values(state.players).some((p) =>
      p.graveyard.some((o) => o.id === sourceId),
    );
    if (activeZone === Zone.Graveyard) return isInGraveyard;

    const isInHand = Object.values(state.players).some((p) =>
      p.hand.some((o) => o.id === sourceId),
    );
    if (activeZone === Zone.Hand) return isInHand;

    const isInStack = state.stack.some((o) => o.id === sourceId || (o as any).sourceId === sourceId);
    if (activeZone === Zone.Stack) return isInStack;

    const isInExile = state.exile.some((o) => o.id === sourceId);
    if (activeZone === Zone.Exile) return isInExile;

    return false;
  }


  private static getEventBuckets(eventMatch: string | string[]): string[] {
    const matches = Array.isArray(eventMatch) ? eventMatch : [eventMatch];
    const buckets = new Set<string>();

    matches.forEach(m => {
      buckets.add(m);
      // Add aliases: These ensure that a trigger caring about 'X_Other' is placed in the 'X' bucket.
      if (m === TriggerEvent.EnterBattlefieldOther) buckets.add(TriggerEvent.EnterBattlefield);
      if (m === TriggerEvent.AttackOrBlock) {
        buckets.add(TriggerEvent.Attack);
        buckets.add(TriggerEvent.Block);
      }
      if (m === TriggerEvent.DamageDealtToCreature) buckets.add(TriggerEvent.DamageTaken);
      if (m === TriggerEvent.DeathOther) buckets.add(TriggerEvent.Death);
      if (m === TriggerEvent.CountersAddedOther) buckets.add(TriggerEvent.CountersAdded);
      if (m === TriggerEvent.Magecraft || m === TriggerEvent.MagecraftOpponent) {
        buckets.add(TriggerEvent.CastInstantOrSorcery);
        buckets.add(TriggerEvent.CopySpell);
      }
    });

    return Array.from(buckets);
  }

  private static collectMatchingTriggers(
    state: GameState,
    event: GameEvent,
  ): TriggeredAbility[] {
    const { logger } = getProcessors(state);
    // 1. REBUILD TRIGGER CACHE IF STALE (O(N) rebuild, but only once per state version)
    if (!state._triggerCache || state._triggerCache.version !== state.stateVersion) {
      const allTriggers: any[] = [];

      // Gather Emblems
      if (state.emblems) {
        state.emblems.forEach((emblem) => {
          if (emblem.abilities) {
            emblem.abilities.forEach((ability: any, index: number) => {
              if (ability.type === AbilityType.Triggered) {
                allTriggers.push({
                  ...ability,
                  id: `emblem_trigger_${emblem.id}_${index}`,
                  sourceId: emblem.id,
                  controllerId: emblem.controllerId,
                  activeZone: Zone.Command,
                  abilityIndex: index,
                });
              }
            });
          }
        });
      }

      // Gather Continuous Effect (Granted) Triggers
      state.ruleRegistry.continuousEffects.forEach((effect) => {
        if (effect.type === EffectType.AddTriggeredAbility && (effect as any).value) {
          const targetIds = effect.targetIds || [];
          targetIds.forEach((tid) => {
            const obj = RuleUtils.findObject(state, tid);
            allTriggers.push({
              ...(effect as any).value,
              id: `granted_trigger_${effect.id}_${tid}`,
              sourceId: tid,
              controllerId: obj ? RuleUtils.getController(obj) : effect.controllerId,
            });
          });
        }
      });

      // Gather Registry Triggers
      if (state.ruleRegistry.triggeredAbilities) {
        state.ruleRegistry.triggeredAbilities.forEach((t) => allTriggers.push(t));
      }

      // Index by bucket
      const buckets = new Map<string, any[]>();
      allTriggers.forEach(t => {
        const tBuckets = this.getEventBuckets(t.eventMatch);
        tBuckets.forEach(b => {
          if (!buckets.has(b)) buckets.set(b, []);
          buckets.get(b)!.push(t);
        });
      });

      state._triggerCache = {
        version: state.stateVersion,
        buckets,
        allTriggers
      };
    }

    const cache = state._triggerCache;
    const candidates = cache.buckets.get(event.type) || [];
    
    if (event.type === TriggerEvent.EndStep || event.type === TriggerEvent.Exile) {
      logger.debug(state, LogCategory.TRIGGER, `[TRIGGER-DEBUG] Event ${event.type}. Found ${candidates.length} candidates in bucket.`);
      candidates.forEach((t: any) => {
        logger.debug(state, LogCategory.TRIGGER, `  - Candidate: ${t.id} (Source: ${t.sourceId}) Targets: ${t.targets?.join(', ')}`);
      });
    }

    if (event.type === TriggerEvent.CastSpell) {
      logger.debug(state, LogCategory.TRIGGER, `[TRIGGER-DEBUG] Event ${event.type} for source ${event.payload?.sourceId}. Found ${candidates.length} candidate triggers in bucket.`);
    }

    return candidates.filter((t: any) => {
      const tEvent = t.eventMatch;
      const tEvents = Array.isArray(tEvent) ? tEvent : [tEvent];

      // Identity and Logic Filtering (replaces matchesPrimary block)
      const matchesPrimary = tEvents.some((type) => {
        return (
          type === event.type ||
          (type === TriggerEvent.EnterBattlefieldOther && event.type === TriggerEvent.EnterBattlefield) ||
          (type === TriggerEvent.AttackOrBlock && (event.type === TriggerEvent.Attack || event.type === TriggerEvent.Block)) ||
          (type === TriggerEvent.DamageDealtToCreature && event.type === TriggerEvent.DamageTaken) ||
          (type === TriggerEvent.DamageDealtToPlayer && event.type === TriggerEvent.DamageDealtToPlayer) ||
          (type === TriggerEvent.DeathOther && event.type === TriggerEvent.Death) ||
          (type === TriggerEvent.CountersAddedOther && event.type === TriggerEvent.CountersAdded) ||
          (type === TriggerEvent.Magecraft &&
            String(event.playerId) === String(t.controllerId) &&
            (event.type === TriggerEvent.CastInstantOrSorcery || (event.type === TriggerEvent.CopySpell && event.payload?.isInstantOrSorcery))) ||
          (type === TriggerEvent.MagecraftOpponent &&
            String(event.playerId) !== String(t.controllerId) &&
            (event.type === TriggerEvent.CastInstantOrSorcery || (event.type === TriggerEvent.CopySpell && event.payload?.isInstantOrSorcery)))
        );
      });

      if (!matchesPrimary) return false;

      // Identity Filtering (Rule 603.2)
      if (event.type === TriggerEvent.EnterBattlefield) {
        const enteringId = RuleUtils.getSource(event);
        const expectsSelf = tEvents.includes(TriggerEvent.EnterBattlefield);
        const expectsOther = tEvents.includes(TriggerEvent.EnterBattlefieldOther);

        if (expectsSelf && !expectsOther && enteringId !== t.sourceId) return false;
        if (expectsOther && !expectsSelf && enteringId === t.sourceId) return false;
      }
      if (event.type === TriggerEvent.Death) {
        const deadId = RuleUtils.getTargets(event)[0];
        if (tEvents.includes(TriggerEvent.Death) && deadId !== t.sourceId)
          return false;
        if (tEvents.includes(TriggerEvent.DeathOther) && deadId === t.sourceId)
          return false;
      }
      if (event.type === TriggerEvent.CountersAdded) {
        const targetId = RuleUtils.getTargets(event)[0];
        if (tEvents.includes(TriggerEvent.CountersAdded) && targetId !== t.sourceId)
          return false;
        if (
          tEvents.includes(TriggerEvent.CountersAddedOther) &&
          targetId === t.sourceId
        )
          return false;
      }
      if (event.type === TriggerEvent.DamageDealtToPlayer) {
        if (!t.isGlobal && RuleUtils.getSource(event) !== t.sourceId) return false;
      }

      if (
        event.type === TriggerEvent.Attack ||
        event.type === TriggerEvent.Block
      ) {
        if (
          tEvents.includes(TriggerEvent.Attack) ||
          tEvents.includes(TriggerEvent.Block) ||
          tEvents.includes(TriggerEvent.AttackOrBlock)
        ) {
          // Only check identity if card is not using global condition (convention)
          // Or if the event source is one of the targeted objects for this trigger (granted abilities fallback)
          if (
            RuleUtils.getSource(event) !== t.sourceId &&
            !t.isGlobal &&
            !t.condition?.includes("EVENT_SOURCE") &&
            !t.targetIds?.includes(RuleUtils.getSource(event))
          )
            return false;
        }
      }

      if (event.type === TriggerEvent.CastSpell) {
        const castId = RuleUtils.getSource(event);
        // Standard trigger (source is card/object itself)
        if (tEvents.includes(TriggerEvent.CastSpell)) {
          if (t.isGlobal) {
            // Global triggers don't need identity match
          } else if (castId !== t.sourceId) {
            return false;
          }
        }
      }

      if (!this.checkZone(state, t, event.type)) return false;

      // Rule 603.4: Intervening If
      const condition = t.condition;
      if (condition) {
        if (typeof condition === "function") {
          if (!condition(state, event, t)) return false;
        } else {
          const { condition: ConditionProcessor } = getProcessors(state);
          const matchesInfo = {
            sourceId: t.sourceId,
            controllerId: t.controllerId,
            event,
            stackObject: t,
          };
          if (!ConditionProcessor.matchesCondition(state, condition, matchesInfo)) {
            if (event.type === TriggerEvent.PreCombatMainPhaseStart) logger.debug(state, LogCategory.TRIGGER, `Trigger ${t.id} failed condition ${condition}.`);
            return false;
          }
        }
      }

      if (event.type === TriggerEvent.PreCombatMainPhaseStart) logger.debug(state, LogCategory.TRIGGER, `Trigger ${t.id} successfully matched event ${event.type}!`);

      if (!this.checkZone(state, t, event.type)) return false;

      if (t.limitPerTurn) {
        const usedCount =
          state.turnState.triggeredAbilitiesUsedThisTurn[t.id] || 0;
        if (usedCount >= t.limitPerTurn) return false;
      }

      return true;
    });
  }

  private static processSystemKeywords(
    state: GameState,
    event: GameEvent,
    matchingTriggers: TriggeredAbility[],
  ) {
    this.processProwess(state, event, matchingTriggers);
    this.processIncrement(state, event, matchingTriggers);
    this.processWard(state, event, matchingTriggers);
    this.processCascadeAndStorm(state, event, matchingTriggers);
    this.processRepartee(state, event, matchingTriggers);
    this.processParadigm(state, event, matchingTriggers);
    this.processLandfall(state, event, matchingTriggers);
    this.processOpus(state, event, matchingTriggers);
  }

  private static processProwess(
    state: GameState,
    event: GameEvent,
    matchingTriggers: TriggeredAbility[],
  ) {
    if (event.type === TriggerEvent.CastNonCreature && event.playerId) {
      const { layer: LayerProcessor } = getProcessors(state);
      state.battlefield.forEach((obj) => {
        const stats = LayerProcessor.getEffectiveStats(obj, state);
        if (
          RuleUtils.hasKeyword(obj, "Prowess") &&
          RuleUtils.getController(obj) === event.playerId
        ) {
          matchingTriggers.push({
            id: `prowess_system_${obj.id}_${Date.now()}`,
            sourceId: obj.id,
            controllerId: RuleUtils.getController(obj),
            eventMatch: TriggerEvent.CastNonCreature,
            effects: [
              {
                type: EffectType.ApplyContinuousEffect,
                duration: {
                  type: DurationType.UntilEndOfTurn,
                },
                powerModifier: 1,
                toughnessModifier: 1,
                layer: 7,
                targetMapping: TargetMapping.Self,
              },
            ],
          });
        }
      });
    }
  }

  private static processIncrement(
    state: GameState,
    event: GameEvent,
    matchingTriggers: TriggeredAbility[],
  ) {
    if (event.type === TriggerEvent.CastSpell && event.playerId) {
      const { layer: LayerProcessor, condition: ConditionProcessor } = getProcessors(state);
      state.battlefield.forEach((obj) => {
        const stats = LayerProcessor.getEffectiveStats(obj, state);
        if (
          RuleUtils.hasKeyword(obj, "Increment") &&
          RuleUtils.getController(obj) === event.playerId
        ) {
          if (
            ConditionProcessor.matchesCondition(
              state,
              "SPENT_MANA_GT_POWER_OR_TOUGHNESS",
              {
                sourceId: obj.id,
                controllerId: RuleUtils.getController(obj),
                event,
              },
            )
          ) {
            matchingTriggers.push({
              id: `increment_system_${obj.id}_${Date.now()}`,
              sourceId: obj.id,
              controllerId: RuleUtils.getController(obj),
              eventMatch: TriggerEvent.CastSpell,
              condition: "SPENT_MANA_GT_POWER_OR_TOUGHNESS",
              effects: [
                {
                  type: EffectType.AddCounters,
                  amount: 1,
                  counterType: "+1/+1",
                  targetMapping: TargetMapping.Self,
                },
              ],
            });
          }
        }
      });
    }
  }

  private static processWard(
    state: GameState,
    event: GameEvent,
    matchingTriggers: TriggeredAbility[],
  ) {
    const { logger } = getProcessors(state);
    const targetId = RuleUtils.getTargets(event)[0];
    if (event.type === TriggerEvent.BecomeTarget && targetId) {
      const { layer: LayerProcessor } = getProcessors(state);
      const targetObj = state.battlefield.find((o) => o.id === targetId);
      if (targetObj) {
        const stats = LayerProcessor.getEffectiveStats(targetObj, state);
        const wards = stats.keywords.filter((k: string) =>
          k.toLowerCase().startsWith("ward"),
        );
        const sourceControllerId = event.playerId;
        if (
          sourceControllerId &&
          sourceControllerId !== RuleUtils.getController(targetObj)
        ) {
          wards.forEach((wardStr: string) => {
            const match = wardStr.match(
              /Ward(?:\s+|—\s*|:\s*)(?:Pay\s+)?(.+)/i,
            );
            if (!match) return;
            const costStr = match[1].trim();
            const choiceCosts: any[] = [];
            let labelStr = costStr;

            if (costStr.toLowerCase().includes("life")) {
              const amount = parseInt(costStr.replace(/\D/g, "")) || 0;
              choiceCosts.push({ type: CostType.PayLife, value: String(amount) });
              labelStr = `Pay ${amount} life`;
            } else if (costStr.toLowerCase().includes("discard")) {
              const amount = parseInt(costStr.replace(/\D/g, "")) || 1;
              choiceCosts.push({ type: CostType.Discard, amount: amount });
              labelStr = `Discard ${amount} card${amount > 1 ? "s" : ""}`;
            } else if (costStr.includes("{") || !isNaN(parseInt(costStr))) {
              const manaVal = costStr.startsWith("{")
                ? costStr
                : `{${costStr}}`;
              choiceCosts.push({ type: CostType.Mana, value: manaVal });
              labelStr = `Pay ${manaVal}`;
            }

            logger.debug(state, LogCategory.TRIGGER, `[WARD] Ward triggering for ${targetObj.definition.name}. Cost: ${labelStr}`);
            matchingTriggers.push({
              id: `ward_gen_${targetObj.id}_${Date.now()}`,
              sourceId: targetObj.id,
              controllerId: targetObj.controllerId,
              eventMatch: TriggerEvent.BecomeTarget,
              activeZone: Zone.Battlefield,
              effects: [
                {
                  type: EffectType.Choice,
                  label: `Ward Trigger: ${labelStr} or spell/ability will be countered.`,
                  targetMapping: "EVENT_PLAYER",
                  choices: [
                    { label: labelStr, costs: choiceCosts, effects: [] },
                    {
                      label: "Don't Pay (Counter)",
                      effects: [
                        {
                          type: EffectType.CounterSpellOrAbility,
                          targetMapping: TargetMapping.TriggerEventSource,
                        },
                      ],
                    },
                  ],
                },
              ],
            });
          });
        }
      }
    }
  }

  private static processCascadeAndStorm(
    state: GameState,
    event: GameEvent,
    matchingTriggers: TriggeredAbility[],
  ) {
    const { logger } = getProcessors(state);
    const card = event.payload?.object;
    if (event.type === TriggerEvent.CastSpell && card) {
      const stats = LayerProcessor.getEffectiveStats(card, state);
      const { keywords } = stats;

      // Cascade
      const cascadeInstances = keywords.filter(
        (k: string) => k.toLowerCase() === "cascade",
      );
      cascadeInstances.forEach((_: any, i: number) => {
        matchingTriggers.push({
          id: `cascade_system_${card.id}_${Date.now()}_${i}`,
          sourceId: card.id,
          controllerId: event.playerId!,
          eventMatch: TriggerEvent.CastSpell,
          effects: [
            {
              type: EffectType.RevealUntilCondition,
              restrictions: [
                Restriction.NonLand,
                Restriction.ManaValueLessThanSource,
              ],
              zone: Zone.Exile,
              remainderZone: Zone.Library,
              remainderPosition: "bottom",
              shuffleRemainder: true,
              isSpellCasting: true,
              isFreeCast: true,
              next: {
                type: EffectType.Choice,
                label: "Cast the revealed card?",
                choices: [
                  {
                    label: "Yes",
                    effects: [
                      {
                        type: EffectType.CastSpell,
                        targetMapping: TargetMapping.Target1,
                        isFreeCast: true,
                      },
                    ],
                  },
                  {
                    label: "No",
                    effects: [
                      {
                        type: EffectType.MoveToZone,
                        zone: Zone.Library,
                        libraryPosition: "bottom",
                        targetMapping: TargetMapping.Target1,
                      },
                    ],
                  },
                ],
              },
            },
          ],
        });
      });

      // Storm
      if (keywords.some((k: string) => k.toLowerCase() === "storm")) {
        const totalSpells = Object.values(
          state.turnState.spellsCastThisTurn,
        ).reduce((a, b) => a + (b as number), 0);
        const stormCount = totalSpells - 1;
        if (stormCount > 0) {
          for (let i = 0; i < stormCount; i++) {
            matchingTriggers.push({
              id: `storm_copy_${card.id}_${i}_${Date.now()}`,
              sourceId: card.id,
              controllerId: event.playerId!,
              eventMatch: TriggerEvent.CastSpell,
              effects: [
                {
                  type: EffectType.CopySpellOnStack,
                  targetMapping: TargetMapping.TriggerEventSource,
                  chooseNewTargets: true,
                },
              ],
            });
          }
        }
      }
    }
  }

  private static processParadigm(
    state: GameState,
    event: GameEvent,
    matchingTriggers: TriggeredAbility[],
  ) {
    const { logger } = getProcessors(state);
    const card = event.payload?.object;
    if (!card) {
      if (event.type === TriggerEvent.ResolveSpell) logger.debug(state, LogCategory.TRIGGER, `[PARADIGM-DEBUG] No card found in event ${event.type}`);
      return;
    }

    const stats = LayerProcessor.getEffectiveStats(card, state);
    const { keywords } = stats;
    const hasParadigm = keywords.some((k: string) => k.toLowerCase() === "paradigm");

    if (event.type === TriggerEvent.ResolveSpell || event.type === TriggerEvent.CastSpell) {
      logger.debug(state, LogCategory.TRIGGER, `[PARADIGM-DEBUG] Checking ${card.definition.name} for Paradigm. hasParadigm=${hasParadigm}`);
    }

    if (!hasParadigm) return;

    if (event.type === TriggerEvent.CastSpell) {
      // 1. Ensure the spell exiles on resolution
      const stackObj = state.stack.find((s) => s.sourceId === card.id);
      if (stackObj) {
        stackObj.exileOnResolution = true;
        logger.info(state, LogCategory.TRIGGER, `[PARADIGM] Marked ${card.definition.name} to exile on resolution.`);
      }
    } else if (event.type === TriggerEvent.ResolveSpell) {
      // 2. Register recurring trigger if it's the first time
      const spellName = card.definition.name;
      const playerId = event.playerId!;

      const existingTriggerId = `paradigm_${playerId}_${spellName}`;
      const alreadyRegistered = state.ruleRegistry.triggeredAbilities.some(
        (t) => t.id === existingTriggerId,
      );
      logger.debug(state, LogCategory.TRIGGER, `[PARADIGM-DEBUG] Resolution event for ${spellName}. alreadyRegistered=${alreadyRegistered}`);

      if (!alreadyRegistered) {
        state.ruleRegistry.triggeredAbilities.push({
          type: AbilityType.Triggered,
          eventMatch: TriggerEvent.PreCombatMainPhaseStart,
          condition: ConditionType.IsYourTurn,
          id: existingTriggerId,
          sourceId: card.id,
          controllerId: playerId,
          isGlobal: true, // Paradigm persists regardless of the card's zone
          effects: [
            {
              type: EffectType.Choice,
              label: `Paradigm: Cast ${spellName}?`,
              choices: [
                {
                  label: `Cast copy of ${spellName}`,
                  effects: [
                    {
                      type: EffectType.CastSpell,
                      isFreeCast: true,
                      isParadigmCopy: true,
                      value: spellName,
                    },
                  ],
                },
                { label: "Decline", effects: [] },
              ],
            },
          ],
          data: { definition: card.definition },
        });
        const { logger } = getProcessors(state);
        logger.info(state, LogCategory.TRIGGER, 
          `[PARADIGM] Registered recurring recast trigger for ${spellName}.`,
        );
      }
    }
  }

  private static processRepartee(
    state: GameState,
    event: GameEvent,
    matchingTriggers: TriggeredAbility[],
  ) {
    if (event.type === TriggerEvent.CastInstantOrSorcery && event.playerId) {
      const processors = getProcessors(state);
      const castSourceId = RuleUtils.getSource(event);
      if (!castSourceId) return;
      const stackObj = processors.lki.getLki(state, castSourceId, Zone.Stack) || state.stack.find(s => s.id === castSourceId);
      const targets = RuleUtils.isStackObject(stackObj) ? stackObj.targets : (event.payload?.targetIds || []);
      
      if (
        targets.length > 0 &&
        targets.some((tid: string) => {
          const obj = RuleUtils.findObject(state, tid);
          return obj && obj.zone === Zone.Battlefield && RuleUtils.isCreature(obj);
        })
      ) {
        state.battlefield.forEach((obj) => {
          if (
            obj.controllerId === event.playerId &&
            obj.definition.keywords?.includes("Repartee")
          ) {
            const reparteeAbility = (oracle.getCard(obj.definition.name)?.abilities || [])
              .find((a: any): a is TriggeredAbilityDefinition =>
                a.eventMatch === TriggerEvent.Repartee || a.name === "Repartee" || String(a.id || "").includes("repartee")
              );

            if (reparteeAbility) {
              matchingTriggers.push({
                ...reparteeAbility,
                id: `repartee_gen_${obj.id}_${Date.now()}`,
                sourceId: obj.id,
                controllerId: obj.controllerId,
              });
            }
          }
        });
      }
    }
  }

  private static processLandfall(
    state: GameState,
    event: GameEvent,
    matchingTriggers: TriggeredAbility[],
  ) {
    const obj = RuleUtils.getEventObject(event, state);
    if (
      event.type === TriggerEvent.EnterBattlefield &&
      obj && RuleUtils.isType(obj, "land")
    ) {
      state.battlefield.forEach((p) => {
        if (p.controllerId === obj.controllerId) {
          const landfallAbility = (oracle.getCard(p.definition.name)?.abilities || [])
            .find((a: any): a is TriggeredAbilityDefinition =>
              a.eventMatch === TriggerEvent.Landfall || a.name === "Landfall"
            );
          if (landfallAbility) {
            matchingTriggers.push({
              ...landfallAbility,
              id: `landfall_${p.id}_${Date.now()}`,
              sourceId: p.id,
              controllerId: p.controllerId,
            });
          }
        }
      });
    }
  }

  private static processOpus(
    state: GameState,
    event: GameEvent,
    matchingTriggers: TriggeredAbility[],
  ) {
    if (event.type === TriggerEvent.CastInstantOrSorcery && event.playerId) {
      state.battlefield.forEach((p) => {
        if (p.controllerId === event.playerId) {
          const opusAbility = (oracle.getCard(p.definition.name)?.abilities || [])
            .find((a: any): a is TriggeredAbilityDefinition => a.eventMatch === TriggerEvent.Opus || a.name === "Opus");
          if (opusAbility) {
            // Avoid adding duplicate trigger if collectMatchingTriggers already found it
            const alreadyAdded = matchingTriggers.some(
              (t) =>
                t.sourceId === p.id &&
                (t.name === "Opus" || t.oracleText?.includes("Opus")),
            );
            if (!alreadyAdded) {
              matchingTriggers.push({
                ...opusAbility,
                id: `opus_sys_${p.id}_${Date.now()}`,
                sourceId: p.id,
                controllerId: p.controllerId,
                payload: {
                  spent: event.payload?.spent || 0,
                },
              });
            }
          }
        }
      });
    }
  }

  private static sortByAPNAP(
    state: GameState,
    triggers: TriggeredAbility[],
  ): TriggeredAbility[] {
    const activePlayerId = state.activePlayerId;

    // This is a simplified sort:
    // Active player triggers go on the stack FIRST (resolving LAST)
    // Non-active player triggers go on the stack LAST (resolving FIRST)
    return [...triggers].sort((a, b) => {
      if (
        a.controllerId === activePlayerId &&
        b.controllerId !== activePlayerId
      )
        return -1;
      if (
        a.controllerId !== activePlayerId &&
        b.controllerId === activePlayerId
      )
        return 1;
      return 0; // Same player - in a real engine, the player would choose
    });
  }
}
