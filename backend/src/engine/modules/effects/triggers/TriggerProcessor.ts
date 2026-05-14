import {
  EffectDefinition,
  EffectType,
  GameEvent,
  GameObjectId,
  GameState,
  PlayerId,
  Restriction,
  StackObject,
  TargetMapping,
  TriggeredAbility,
  TriggerEvent,
  TriggerAbilityEffect,
  Zone,
  DurationType,
  AbilityType,
  CardDefinition,
} from "@shared/engine_types";
import { LogCategory } from "../../../utils/EngineLogger";
import { RuleUtils } from "../../../utils/RuleUtils";
import { getProcessors } from "../../ProcessorRegistry";
import { Profiler } from "../../../utils/Profiler";
import { SystemKeywordTriggers } from "./SystemKeywordTriggers";
import { TriggerStacker } from "./TriggerStacker";

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
      // 1. Identify all triggered abilities that match this event (Rule 603.2)
      const matchingTriggers = this.collectMatchingTriggers(state, event);

      // 2. Process system-recognized keywords (Prowess, Ward, etc.)
      this.processSystemKeywords(state, event, matchingTriggers);

      if (matchingTriggers.length === 0) return;

      // --- DEDUPLICATION (Fix for Issue #2: prevents multiple triggers for the same ability instance) ---
      // We use a composite key of sourceId + ability name (or type) to ensure we don't fire the same thing twice for one card.
      const uniqueTriggersMap = new Map<string, TriggeredAbility>();
      matchingTriggers.forEach((t: TriggeredAbility) => {
        const key = `${t.id || t.sourceId + "_" + (t.abilityIndex || 0)}`;
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

      // 4. Cleanup one-shot delayed triggers (Rule 603.7)
      // Must happen BEFORE execution to prevent recursive loops
      matchingTriggers.forEach((t: TriggeredAbility) => {
        if (t.isDelayed) {
          const startsWithUntil =
            t.duration &&
            (typeof t.duration === 'string'
              ? String(t.duration).toUpperCase().startsWith("UNTIL")
              : (t.duration.type && String(t.duration.type).toUpperCase().startsWith("UNTIL")));

          if (t.oneShot || !startsWithUntil) {
            const index = state.ruleRegistry.triggeredAbilities.findIndex(orig => orig.id === t.id);
            if (index !== -1) {
              logger.info(state, LogCategory.TRIGGER, `[CLEANUP] Removing one-shot delayed trigger (In-place): ${t.id}`);
              state.ruleRegistry.triggeredAbilities.splice(index, 1);
              state.stateVersion++;
              if (state._triggerCache) state._triggerCache.version = -1;
            } else {
              logger.warn(state, LogCategory.TRIGGER, `[CLEANUP-FAILED] Trigger ${t.id} not found in registry for removal!`);
            }
          }
        }
      });

      // 5. Process each unique trigger
      for (const trigger of uniqueTriggers) {
        if (trigger.type === AbilityType.Activated) continue;

        const sourceId = trigger.sourceId;
        const controllerId = trigger.controllerId;
        const sourceObj = RuleUtils.findObject(state, sourceId);

        // --- TRIGGER DOUBLING (CR 603.2c / 614.16) ---
        let triggerCount = 1;

        // 5a. Replacement Effects (e.g. Shrine doubling)
        const triggerEvents: string[] = [TriggerEvent.OnTrigger];
        if (sourceObj && RuleUtils.hasSubtype(sourceObj, Restriction.Shrine)) {
          triggerEvents.push(TriggerEvent.OnShrineTrigger);
        }

        for (const eventName of triggerEvents) {
          const tEvent: GameEvent = {
            type: eventName,
            playerId: trigger.controllerId,
            payload: { sourceId: trigger.sourceId, object: sourceObj, stackSnapshot: { trigger, object: sourceObj } }
          };
          const replacements = (state.ruleRegistry.replacementEffects || []).filter(r => r.replacesEvent === eventName);
          for (const r of replacements) {
            const context: any = { ...r, targets: r.targets || [] };
            const { condition: ConditionProcessor } = getProcessors(state);
            const conditionMet = !r.condition || ConditionProcessor.matchesCondition(state, r.condition, context);
            if (conditionMet && r.effects?.some((e: EffectDefinition) => e.type === EffectType.AddAdditionalTrigger)) {
              triggerCount++;
              logger.info(state, LogCategory.TRIGGER, `[DOUBLED] ${RuleUtils.isEntity(sourceObj) ? sourceObj.definition.name : 'Ability'} triggers via replacement.`);
            }
          }
        }

        // 5b. Continuous Effects (e.g. Teysa Karlov)
        const doublingEffects = state.ruleRegistry.continuousEffects.filter(e => e.type === EffectType.AddAdditionalTrigger);
        for (const eff of doublingEffects) {
          if (eff.controllerId !== trigger.controllerId) continue;
          if (eff.restrictions && sourceObj) {
            const { targeting: TargetingProcessor } = getProcessors(state);
            const matches = TargetingProcessor.matchesRestrictions(state, sourceObj, eff.restrictions, { sourceId: eff.sourceId, controllerId: eff.controllerId, effects: [], targets: [] });
            if (!matches) continue;
          }
          triggerCount++;
          logger.info(state, LogCategory.TRIGGER, `[DOUBLED] ${RuleUtils.isEntity(sourceObj) ? sourceObj.definition.name : 'Ability'} triggers via continuous.`);
        }

        // 6. Create stack objects and queue them
        for (let i = 0; i < triggerCount; i++) {
          if (trigger.limitPerTurn && i === 0) {
            state.turnState.triggeredAbilitiesUsedThisTurn[trigger.id] =
              (state.turnState.triggeredAbilitiesUsedThisTurn[trigger.id] || 0) + 1;
          }

          if (trigger.isGlobal || trigger.isDelayed || this.isAbilityActive(state, trigger)) {
            const stackObj = this.createStackObject(state, trigger, event);
            if (stackObj) {
              // Rule 603.3: Queue triggers in pending state. 
              // They will be moved to the stack in APNAP order by processPendingTriggers.
              state.pendingTriggers.push(stackObj);
              if (trigger.id?.startsWith('miracle_trigger')) {
                logger.info(state, LogCategory.TRIGGER, `[MIRACLE-STACK] Miracle trigger for ${sourceObj && 'definition' in sourceObj ? sourceObj.definition.name : 'unknown'} PUSHED TO STACK. (ID: ${stackObj.id})`);
              }
              logger.debug(state, LogCategory.TRIGGER, `[TRIGGER-QUEUE] ${trigger.oracleText || 'Ability'} queued (ID: ${stackObj.id}).`);

              if (event.type !== 'ON_TRIGGER_QUEUED') {
                this.onEvent(state, {
                  type: 'ON_TRIGGER_QUEUED',
                  playerId: trigger.controllerId,
                  payload: { sourceId: stackObj.id, object: stackObj, stackSnapshot: { trigger, originalEvent: event } }
                });
              }
            }
          }
        }
      }
    } catch (e) {
      getProcessors(state).logger.error(state, LogCategory.TRIGGER, `[TRIGGER-ERROR] Error in onEvent: ${e}`);
    } finally {
      Profiler.endWithThreshold('trigger.check', 10.0);
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
    return TriggerStacker.processPendingTriggers(state);
  }

  /**
   * Rule 603.7: Delayed Triggered Abilities
   * Created by effects during resolution. Usually triggers only once.
   */
  public static createDelayedTrigger(
    state: GameState,
    effect: EffectDefinition,
    sourceId: GameObjectId,
    controllerId: PlayerId,
  ) {
    const { logger } = getProcessors(state);
    const triggerId = `delayed_${sourceId}_${Date.now()}`;
    const delayedTrigger: TriggeredAbility = {
      id: triggerId,
      sourceId,
      controllerId,
      eventMatch: (effect as TriggerAbilityEffect).eventMatch || '', // eventMatch is dynamic for delayed triggers
      effects: effect.effects || [],
      duration: (effect.duration as import('@shared/engine_types').EffectDuration) || { type: DurationType.Permanent },
      condition: effect.condition,
      payload: { metadata: effect.data },
      targetIds: effect.targetIds,
      isDelayed: true,
      oneShot: (effect as TriggerAbilityEffect).oneShot ?? true, // Default to one-shot for delayed triggers unless specified
      activeZone: Zone.Any, // Virtual zone for registry (Rule 603.7)
      type: AbilityType.Triggered,
      targets: [],
    };
    getProcessors(state).logger.debug(state, LogCategory.TRIGGER, `[DELAYED-REG] Registering trigger ${delayedTrigger.id} (oneShot: ${delayedTrigger.oneShot}, duration: ${delayedTrigger.duration?.type}) with targets: ${delayedTrigger.targetIds?.join(', ')}`);


    if (!state.ruleRegistry.triggeredAbilities)
      state.ruleRegistry.triggeredAbilities = [];
    state.ruleRegistry.triggeredAbilities.push(delayedTrigger);

    // Invalidate trigger cache
    if (state._triggerCache) state._triggerCache.version = -1;

    logger.info(state, LogCategory.TRIGGER, `[DELAYED-REG] Registered: triggered on ${delayedTrigger.eventMatch} (ID: ${delayedTrigger.id}). Registry size: ${state.ruleRegistry.triggeredAbilities.length}`);
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
          !t.isDelayed || t.duration?.type !== DurationType.UntilEndOfTurn,
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
      (RuleUtils.isEntity(sourceObj) ? sourceObj.definition.name : null) || emblemSource?.name || "Unknown Source";
    const sourceImage =
      (RuleUtils.isEntity(sourceObj) ? sourceObj.definition.image_url : null) || emblemSource?.image_url || trigger.image_url;

    const stackId = `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const effects = trigger.effects || [];
    const exileOnResolution = trigger.exileOnResolution || (RuleUtils.isEntity(sourceObj) ? sourceObj.definition.exileOnResolution : false) || effects.some((e: EffectDefinition) =>
      (e.type === EffectType.Exile || e.type === EffectType.ExileAllCards || e.type === EffectType.MoveToZone) &&
      (e.targetMapping === TargetMapping.Self || e.targetIds?.includes(trigger.sourceId)) &&
      (!e.zone || e.zone === Zone.Exile)
    );

    const stackObj: StackObject = {
      id: stackId,
      controllerId: trigger.controllerId,
      ownerId: sourceObj?.ownerId || trigger.controllerId,
      sourceId: trigger.sourceId,
      type: AbilityType.Triggered,
      counters: {},
      name: `${sourceName}'s Trigger`,
      targets: trigger.targetIds || [],
      effects: effects,
      definition: (RuleUtils.isEntity(sourceObj) ? sourceObj.definition : (trigger.payload?.definition || { name: sourceName, types: [], colors: [], oracleText: "", manaCost: "" } as CardDefinition)),
      image_url: sourceImage,
      abilityIndex: trigger.abilityIndex,
      condition: trigger.condition,
      sourceObject: sourceObj || (emblemSource as any),
      targetDefinitions: trigger.targetDefinitions || [],
      event: event,
      eventAmount: event.payload?.amount,
      sourceName: sourceName,
      effectIndex: 0,
      exileOnResolution: exileOnResolution,
      // Phase 4: Data is now just a backup/snapshot of the event, but we must preserve captured metadata
      data: { ...(trigger.payload?.metadata || {}), event },
      zone: Zone.Stack
    };
    getProcessors(state).logger.debug(state, LogCategory.TRIGGER, `[STACK-OBJ-CREATE] Created stack object ${stackObj.id} with data: ${JSON.stringify(stackObj.data)}`);
    return stackObj;

  }
  public static stackTrigger(
    state: GameState,
    stackObj: StackObject,
  ) {
    TriggerStacker.stackTrigger(state, stackObj);
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

    const isInStack = state.stack.some((o) => o.id === sourceId || o.sourceId === sourceId);
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
        if (effect.type === EffectType.AddTriggeredAbility && effect.value) {
          const targetIds = effect.targetIds || [];
          targetIds.forEach((tid) => {
            const obj = RuleUtils.findObject(state, tid);
            allTriggers.push({
              ...effect.value,
              id: `granted_trigger_${effect.id}_${tid}`,
              sourceId: tid,
              controllerId: obj ? RuleUtils.getController(obj) : effect.controllerId,
            });
          });
        }
      });

      // Gather Registry Triggers
      if (state.ruleRegistry.triggeredAbilities) {
        logger.debug(state, LogCategory.TRIGGER, `[TRIGGER-CACHE] Registry has ${state.ruleRegistry.triggeredAbilities.length} triggers.`);
        state.ruleRegistry.triggeredAbilities.forEach((t) => allTriggers.push(t));
      }

      // Index by bucket
      const buckets = new Map<string, any[]>();
      allTriggers.forEach(t => {
        const tBuckets = this.getEventBuckets(t.eventMatch);
        logger.info(state, LogCategory.TRIGGER, `[CACHE-BUILD] Indexing trigger ${t.id || 'unknown'} for buckets: ${tBuckets.join(', ')} (Match: ${t.eventMatch})`);
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

    if (event.type === TriggerEvent.EndStep || event.type === TriggerEvent.Exile || event.type === TriggerEvent.CastInstantOrSorcery || event.type.includes('END')) {
      logger.info(state, LogCategory.TRIGGER, `[TRIGGER-DEBUG] Event ${event.type}. Found ${candidates.length} candidates in bucket.`);
      candidates.forEach((t: any) => {
        logger.info(state, LogCategory.TRIGGER, `  - Candidate: ${t.id} (Source: ${t.sourceId}) eventMatch: ${t.eventMatch} controllerId: ${t.controllerId} activeZone: ${t.activeZone} isDelayed: ${t.isDelayed} oneShot: ${t.oneShot}`);
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
        const eventObjId = RuleUtils.getEventObject(event, state)?.id;
        
        // Standard trigger (source is card/object itself)
        if (tEvents.includes(TriggerEvent.CastSpell)) {
          if (t.isGlobal) {
            // Global triggers don't need identity match
          } else if (castId !== t.sourceId && eventObjId !== t.sourceId) {
            // It's not a self-trigger. 
            // If the trigger is active on the battlefield, it's a "Whenever you cast" trigger and should match.
            const activeZone = t.activeZone || Zone.Battlefield;
            if (activeZone !== Zone.Battlefield) {
              return false;
            }
          }
        }
      }

      if (!this.checkZone(state, t, event.type)) {
        if (event.type === TriggerEvent.MiracleReveal) {
          logger.debug(state, LogCategory.TRIGGER, `Trigger ${t.id} failed zone check. ActiveZone: ${t.activeZone}, SourceId: ${t.sourceId}`);
        }
        return false;
      }

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
            effects: [],
            targets: []
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
    SystemKeywordTriggers.processSystemKeywords(state, event, matchingTriggers);
  }



  /**
   * CR 603.2: Check if a triggered ability is active in its current zone.
   */
  private static isAbilityActive(state: GameState, ability: TriggeredAbility): boolean {
    const { logger } = getProcessors(state);
    if (ability.isDelayed || ability.isGlobal) return true;
    const source = RuleUtils.findObject(state, ability.sourceId);
    if (!source) return false;

    const activeZone = ability.activeZone || (RuleUtils.isType(source, 'instant') || RuleUtils.isType(source, 'sorcery') ? Zone.Stack : Zone.Battlefield);
    const currentZone = RuleUtils.isEntity(source) ? source.zone : undefined;
    const isActive = currentZone === activeZone || activeZone === Zone.Any;

    if (ability.id?.startsWith('miracle_trigger')) {
      logger.debug(state, LogCategory.TRIGGER, `[MIRACLE-ZONE-CHECK] Trigger: ${ability.name}, Required: ${activeZone}, Current: ${currentZone}, Result: ${isActive}`);
    }

    return isActive;
  }
}
