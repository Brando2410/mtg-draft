import {
  AbilityType,
  CardType,
  ContinuousEffect,
  GameObject, GameState,
  RestrictionObject, RestrictionType,
  Zone
} from "@shared/engine_types";
import { getProcessors } from "../ProcessorRegistry";
let TargetingProcessor: any;
let ConditionProcessor: any;

import type { SpellProcessor as SpellProcessorType } from "../actions/spells/SpellProcessor";
import type { EffectProcessor as EffectProcessorType } from "../effects/EffectProcessor";

// Static imports for performance (avoids require in loops)
let EffectProcessor: typeof EffectProcessorType;
let SpellProcessor: typeof SpellProcessorType;

/**
 * CR 613: Interaction of Continuous Effects
 * This is the "Pipeline" that calculates effective stats based on the "Whiteboard" (Registry).
 */
export class LayerProcessor {
  private static calculationStack = new Set<string>();

  /**
   * CR 613: Interaction of Continuous Effects
   * Returns a copy of the object's stats after applying all relevant layers.
   */
  public static getEffectiveStats(
    obj: GameObject,
    state: GameState,
    log?: (m: string) => void,
    providedActiveEffects?: ContinuousEffect[],
  ) {
    // FAST PATH: Check the state-level stats cache
    if (state._statsCache && state._statsCache.version === state.stateVersion && state._statsCache.has(obj.id)) {
        return state._statsCache.get(obj.id);
    }

    // RECURSION GUARD: Prevent infinite loops where conditions depend on effective stats
    if (this.calculationStack.has(obj.id)) {
      return {
        power: Number(obj.definition.power || 0),
        toughness: Number(obj.definition.toughness || 0),
        keywords: obj.definition.keywords || [],
        colors: obj.definition.colors || [],
        types: obj.definition.types,
        subtypes: obj.definition.subtypes || [],
        isPlayable: false,
        supertypes: obj.definition.supertypes || [],
        restrictions: [] as RestrictionObject[],
      };
    }

    this.calculationStack.add(obj.id);

    if (!EffectProcessor || !TargetingProcessor || !ConditionProcessor) {
      const { effect, targeting, condition } = getProcessors(state);
      EffectProcessor = effect;
      TargetingProcessor = targeting;
      ConditionProcessor = condition;
    }

    try {
      const effects = providedActiveEffects || state.ruleRegistry.continuousEffects || [];

      // 1. FILTER RELEVANT EFFECTS (Rule 613.1)
      const activeEffects = providedActiveEffects || effects.filter((e) => {
        if (e.id?.startsWith("floating_") || e.sourceId === "global")
          return true;
        const source = state.battlefield.find((o) => o.id === e.sourceId);
        if (!source || !e.activeZones.includes(source.zone)) return false;
        return true;
      });

      // 2. STAGE 1: Printed values and Layer 1 (Copiable Values - Rule 707)
      let currentDefinition = { ...obj.definition };
      const supertypes = new Set<string>(currentDefinition.supertypes || []);

      // Pre-group effects by layer to avoid filtering in every iteration
      const layerMap: Record<number, ContinuousEffect[]> = {
        1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []
      };
      activeEffects.forEach(e => {
        if (e.layer && layerMap[e.layer]) layerMap[e.layer].push(e);
        // Fallback for effects with implicit layers
        else if (e.typesToAdd || e.typesSet) layerMap[4].push(e);
        else if (e.colorsToAdd || e.colorSet) layerMap[5].push(e);
        else if (e.abilitiesToAdd || e.abilitiesToRemove || e.removeAllAbilities) layerMap[6].push(e);
        else if (e.powerDynamic || e.toughnessDynamic || e.powerSet !== undefined || e.toughnessSet !== undefined || e.powerModifier !== undefined || e.toughnessModifier !== undefined) layerMap[7].push(e);
      });

      for (const effect of layerMap[1]) {
        if (this.isTarget(state, effect, obj.id, log) && effect.copyFromId) {
          const sourceObj =
            state.battlefield.find((o) => o.id === effect.copyFromId) ||
            TargetingProcessor.findObjectInAnyZone(state, effect.copyFromId);
          if (sourceObj) {
            currentDefinition = { ...sourceObj.definition };
            supertypes.clear();
            (currentDefinition.supertypes || []).forEach((s) =>
              supertypes.add(s),
            );
            if (effect.isNotLegendary) {
              supertypes.delete("Legendary");
            }
          }
        }
      }

      // Initialize working stats from Printed/Layer 1 baseline
      let power = Number(currentDefinition.power || 0);
      let toughness = Number(currentDefinition.toughness || 0);
      const keywords = new Set<string>(currentDefinition.keywords || []);
      const colors = new Set<string>(currentDefinition.colors || []);
      const types = new Set<string>(currentDefinition.types || []);
      const subtypes = new Set<string>(currentDefinition.subtypes || []);

      // 2. LAYER 2: Control-changing effects (Rule 613.1b)
      // 3. LAYER 3: Text-changing effects (Rule 613.1c)

      // 4. LAYER 4: Type-changing effects (Rule 613.1d)
      layerMap[4].forEach((e) => {
        if (!this.isTarget(state, e, obj.id)) return;
        e.typesToAdd?.forEach((t) => types.add(t));
        if (e.typesSet) {
          types.clear();
          e.typesSet.forEach((t) => types.add(t));
        }
        e.subtypesToAdd?.forEach((s) => subtypes.add(s));
        if (e.subtypesSet) {
          subtypes.clear();
          e.subtypesSet.forEach((s) => subtypes.add(s));
        }
      });

      // 5. LAYER 5: Color-changing effects (Rule 613.1e)
      layerMap[5].forEach((e) => {
        if (!this.isTarget(state, e, obj.id)) return;
        e.colorsToAdd?.forEach((c) => colors.add(c));
        if (e.colorSet) {
          colors.clear();
          e.colorSet.forEach((c) => colors.add(c));
        }
      });

      // 6. LAYER 6: Ability Adding/Removing (Rule 613.1f)
      layerMap[6].forEach((e) => {
        if (!this.isTarget(state, e, obj.id)) return;
        if (e.removeAllAbilities) {
          keywords.clear();
        }
        e.abilitiesToAdd?.forEach((k: any) => {
          const keyword =
            typeof k === "string" ? k : k.name || "Unknown";
          keywords.add(keyword);
        });
        e.abilitiesToRemove?.forEach((k) => keywords.delete(k));
      });

      // 7. LAYER 7: Power and/or toughness-changing effects (Rule 613.1g)
      const layer7Effects = layerMap[7];

      // 7a: Characteristic-defining abilities (Rule 613.4a)
      layer7Effects
        .filter((e) => e.powerDynamic || e.toughnessDynamic)
        .forEach((e) => {
          if (!this.isTarget(state, e, obj.id)) return;
          this.applyLayer7(state, e, obj, (p, t) => {
            if (p !== undefined) power = p;
            if (t !== undefined) toughness = t;
          });
        });

      // 7b: Effects that set P/T (Rule 613.4b)
      layer7Effects
        .filter((e) => e.powerSet !== undefined || e.toughnessSet !== undefined)
        .forEach((e) => {
          if (!this.isTarget(state, e, obj.id)) return;
          this.applyLayer7(state, e, obj, (p, t) => {
            if (p !== undefined) power = p;
            if (t !== undefined) toughness = t;
          });
        });

      // 7c: Modifiers and Counters (Rule 613.4c)
      layer7Effects
        .filter(
          (e) =>
            e.powerModifier !== undefined || e.toughnessModifier !== undefined,
        )
        .forEach((e) => {
          if (!this.isTarget(state, e, obj.id)) return;
          let pMod = 0;
          let tMod = 0;

          if (e.powerModifier !== undefined) {
            pMod = EffectProcessor.resolveAmount(
              state,
              e.powerModifier,
              { sourceId: e.sourceId, controllerId: e.controllerId, targets: e.targetIds || [obj.id], effects: [] },
              e.targetIds || [obj.id],
            );
          }
          if (e.toughnessModifier !== undefined) {
            tMod = EffectProcessor.resolveAmount(
              state,
              e.toughnessModifier,
              { sourceId: e.sourceId, controllerId: e.controllerId, targets: e.targetIds || [obj.id], effects: [] },
              e.targetIds || [obj.id],
            );
          }

          const multiplierValue =
            e.multiplier !== undefined ? (typeof e.multiplier === 'number' ? e.multiplier : Number(e.multiplier)) : 1;
          power += pMod * multiplierValue;
          toughness += tMod * multiplierValue;
        });

      // Plus/Minus Counters in 7c
      const plus1 =
        (obj.counters?.["p1p1"] || 0) +
        (obj.counters?.["p1p1_counter"] || 0) +
        (obj.counters?.["+1/+1"] || 0) +
        (obj.counters?.["+1/+1_counter"] || 0);
      const minus1 =
        (obj.counters?.["-1/-1"] || 0) + (obj.counters?.["-1/-1_counter"] || 0);
      const counterBonus = plus1 - minus1;
      power += counterBonus;
      toughness += counterBonus;

      // 7d: Switching (Rule 613.4d)
      if (obj.isPTSwitched) {
        const temp = power;
        power = toughness;
        toughness = temp;
      }

      // Collect structured restrictions
      const structuredRestrictions = activeEffects
        .filter((e) => this.isTarget(state, e, obj.id))
        .flatMap((e) => e.restrictions || [])
        .map((r: string | RestrictionObject) => {
          if (typeof r === "string") {
            return { type: r as RestrictionType };
          }
          return r;
        });

      const stats = {
        power,
        toughness,
        keywords: Array.from(keywords),
        colors: Array.from(colors),
        types: Array.from(types),
        subtypes: Array.from(subtypes),
        restrictions: structuredRestrictions,
        flashbackCostOverride: activeEffects.find(
          (e) =>
            this.isTarget(state, e, obj.id) && e.flashbackCostOverride,
        )?.flashbackCostOverride,
        isPlayable: false,
        supertypes: Array.from(supertypes),
      };

      // CACHE RESULT
      if (!state._statsCache || state._statsCache.version !== state.stateVersion) {
        state._statsCache = new Map();
        state._statsCache.version = state.stateVersion;
      }
      state._statsCache.set(obj.id, stats);

      return stats;
    } finally {
      this.calculationStack.delete(obj.id);
    }
  }

  private static applyLayer7(
    state: GameState,
    effect: ContinuousEffect,
    obj: GameObject,
    update: (p?: number, t?: number) => void,
  ) {
    // Sublayer 7a: Characteristic-defining abilities
    if (
      effect.powerDynamic === "INSTANTS_AND_SORCERIES_IN_GRAVEYARD"
    ) {
      const player = state.players[obj.controllerId];
      if (player) {
        const count = player.graveyard.filter((c) =>
          c.definition.types.some(
            (t) =>
              t.toLowerCase() === "instant" || t.toLowerCase() === "sorcery",
          ),
        ).length;
        update(count, undefined);
      }
    }

    if (effect.powerDynamic === "GREATEST_POWER_IN_GRAVEYARD") {
      const player = state.players[obj.controllerId];
      if (player) {
        const powers = player.graveyard
          .filter((c) =>
            c.definition.types.some((t) => t.toLowerCase() === "creature"),
          )
          .map((c) => Number(c.definition.power || 0));
        const maxPower = powers.length > 0 ? Math.max(...powers) : 0;
        update(maxPower, undefined);
      }
    }

    if (
      effect.powerDynamic === "SOURCE_POWER" ||
      effect.toughnessDynamic === "SOURCE_TOUGHNESS"
    ) {
      const source = state.battlefield.find((o) => o.id === effect.sourceId);
      if (source) {
        const stats = this.getEffectiveStats(source, state);
        update(
          effect.powerDynamic === "SOURCE_POWER" ? stats.power : undefined,
          effect.toughnessDynamic === "SOURCE_TOUGHNESS"
            ? stats.toughness
            : undefined,
        );
      }
    }

    // Sublayer 7b: Effects that set power and/or toughness
    if (effect.powerSet !== undefined || effect.toughnessSet !== undefined) {
      update(
        effect.powerSet !== undefined ? Number(effect.powerSet) : undefined,
        effect.toughnessSet !== undefined
          ? Number(effect.toughnessSet)
          : undefined,
      );
    }
  }

  public static isTarget(
    state: GameState,
    effect: ContinuousEffect,
    objId: string,
    log?: (m: string) => void,
  ): boolean {
    if (!ConditionProcessor || !TargetingProcessor) {
      const { condition, targeting } = getProcessors(state);
      ConditionProcessor = condition;
      TargetingProcessor = targeting;
    }
    // 0. Condition check (can be global or target-dependent)
    if (effect.condition) {
        if (!ConditionProcessor.matchesCondition(state, effect.condition, {
            sourceId: objId,
            targetId: objId,
            effectSourceId: effect.sourceId,
            controllerId: effect.controllerId,
            stackObject: state.stack.find(s => s.id === effect.id) as any
        })) {
            return false;
        }
    }

    // 1. Explicit target list (snapshotted spells)
    if (Array.isArray(effect.targetIds))
      return effect.targetIds.includes(objId);

    // 2. Dynamic target mapping (Static abilities)
    if (effect.targetMapping) {
      const obj = TargetingProcessor.findObjectInAnyZone(state, objId);
      if (!obj) return false;

      switch (effect.targetMapping) {
        case "SELF":
          return objId === effect.sourceId;
        case "ALL_CREATURES_YOU_CONTROL":
          return (
            obj.controllerId === effect.controllerId &&
            obj.definition.types.some(
              (t: string) => t.toLowerCase() === "creature",
            )
          );
        case "ALL_PERMANENTS_YOU_CONTROL":
          return obj.controllerId === effect.controllerId;
        case "OTHER_CREATURES_YOU_CONTROL":
          return (
            obj.id !== effect.sourceId &&
            obj.controllerId === effect.controllerId &&
            obj.definition.types.some(
              (t: string) => t.toLowerCase() === "creature",
            )
          );
        case "MATCHING_PERMANENTS_YOU_CONTROL":
          return (
            obj.controllerId === effect.controllerId &&
            TargetingProcessor.matchesRestrictions(
              state,
              obj,
              effect.restrictions || [],
              { sourceId: effect.sourceId, controllerId: effect.controllerId },
              log,
            )
          );
        case "MATCHING_PERMANENTS":
          return TargetingProcessor.matchesRestrictions(
            state,
            obj,
            effect.restrictions || [],
            { sourceId: effect.sourceId, controllerId: effect.controllerId },
            log,
          );
        case "ALL_CREATURES_OPPONENTS_CONTROL":
        case "OPPONENTS_CREATURES":
          return (
            obj.controllerId !== effect.controllerId &&
            obj.definition.types.some(
              (t: string) => t.toLowerCase() === "creature",
            )
          );
        case "ALL_PERMANENTS_OPPONENTS_CONTROL":
          return obj.controllerId !== effect.controllerId;
        case "OTHER_CREATURES":
        case "ALL_OTHER_CREATURES":
          return (
            obj.id !== effect.sourceId &&
            obj.definition.types.some(
              (t: string) => t.toLowerCase() === "creature",
            )
          );
        case "MATCHING_CARDS":
          return TargetingProcessor.matchesRestrictions(
            state,
            obj,
            effect.restrictions || [],
            { sourceId: effect.sourceId, controllerId: effect.controllerId },
            log,
          );
        case "ENCHANTED_CREATURE":
        case "ENCHANTED_PERMANENT": {
          const source = state.battlefield.find(
            (o) => o.id === effect.sourceId,
          );
          return !!source && source.attachedTo === objId;
        }
        case "PARENT_CONTEXT_EXILED_IDS": {
          // For floating effects resolving this dynamically if snapshot missing
          return Array.isArray(effect.targetIds) && (effect.targetIds as string[]).includes(objId);
        }
        case "CONTROLLER":
          return (
            obj.controllerId === effect.controllerId &&
            TargetingProcessor.matchesRestrictions(
              state,
              obj,
              effect.restrictions || [],
              { sourceId: effect.sourceId, controllerId: effect.controllerId },
              log,
            )
          );
        default:
          return false;
      }
    }

    return true;
  }

  public static getEffectivePower(obj: GameObject, state: GameState): number {
    return this.getEffectiveStats(obj, state).power;
  }

  public static getEffectiveToughness(
    obj: GameObject,
    state: GameState,
  ): number {
    return this.getEffectiveStats(obj, state).toughness;
  }

  public static getEffectiveKeywords(
    obj: GameObject,
    state: GameState,
  ): string[] {
    return this.getEffectiveStats(obj, state).keywords;
  }

  /**
   * Convenience check for specific keywords
   */
  public static hasKeyword(
    obj: GameObject,
    state: GameState,
    keyword: string,
  ): boolean {
    return this.getEffectiveKeywords(obj, state).some(k => k.toLowerCase() === keyword.toLowerCase());
  }

  public static calculateTypeMask(types: string[]): number {
    let mask = 0;
    if (!types) return 0;
    const lowerTypes = types.map(t => t.toLowerCase());
    if (lowerTypes.includes('creature')) mask |= CardType.Creature;
    if (lowerTypes.includes('land')) mask |= CardType.Land;
    if (lowerTypes.includes('artifact')) mask |= CardType.Artifact;
    if (lowerTypes.includes('enchantment')) mask |= CardType.Enchantment;
    if (lowerTypes.includes('planeswalker')) mask |= CardType.Planeswalker;
    if (lowerTypes.includes('instant')) mask |= CardType.Instant;
    if (lowerTypes.includes('sorcery')) mask |= CardType.Sorcery;
    if (lowerTypes.includes('battle')) mask |= CardType.Battle;
    if (lowerTypes.includes('tribal')) mask |= CardType.Tribal;
    return mask;
  }

  /**
   * Rebuilds a Map of all objects in all zones for O(1) lookup during processing.
   */
  public static rebuildObjectCache(state: GameState) {
    const cache = new Map<string, GameObject>();
    
    const allObjects = [
      ...state.battlefield,
      ...state.exile,
      ...state.limbo || [],
      ...Object.values(state.players).flatMap(p => [
        ...p.hand,
        ...p.graveyard,
        ...p.library,
        ...p.virtualHand || []
      ]),
      ...state.stack.map(s => s.card).filter(Boolean) as GameObject[]
    ];

    allObjects.forEach(o => {
      if (!o.typeMask) {
        o.typeMask = this.calculateTypeMask(o.definition.types);
      }
      cache.set(o.id, o);
    });

    state.stack.forEach(s => {
      cache.set(s.id, s as any); // Also index by stack ID
    });

    (cache as any).version = state.stateVersion;
    state._objectCache = cache as any;
    return cache;
  }

  /**
   * Batch updates all derived fields (P/T, Keywords, isPlayable) for all relevant objects.
   * This should be called after any rule-changing event or zone transition.
   */
  public static updateDerivedStats(state: GameState, PriorityProcessor: any) {
    // 0. Initial Cache Setup
    this.rebuildObjectCache(state);
    
    // 0.5. Partial Cache Invalidation: Only clear cache if layer-relevant state changed
    let layerHash = `${state.ruleRegistry.continuousEffects.length}:${state.stack.length}`;
    state.battlefield.forEach(o => {
      layerHash += `|${o.id}:${o.isTapped ? 1 : 0}:${o.isAttacking ? 1 : 0}:${Object.values(o.counters || {}).join(',')}`;
    });
    Object.values(state.players).forEach(p => {
      layerHash += `|${p.life}:${p.hand.length}:${p.graveyard.length}:${Object.values(p.manaPool || {}).join(',')}`;
    });

    const canReuseCache = state._statsCache && state._lastLayerHash === layerHash;

    if (!canReuseCache) {
      state._statsCache = new Map();
      state._lastLayerHash = layerHash;
    }
    // Always update version to current state version to allow hits in getEffectiveStats
    state._statsCache!.version = state.stateVersion;

    const effects = state.ruleRegistry.continuousEffects || [];
    const activeEffects = effects.filter((e) => {
        if (e.id?.startsWith("floating_") || e.sourceId === "global")
          return true;
        const cache = state._objectCache;
        const source = (cache && cache.version === state.stateVersion) 
            ? cache.get(e.sourceId) 
            : state.battlefield.find((o) => o.id === e.sourceId);
        if (!source || !e.activeZones.includes(source.zone)) return false;
        return true;
    });

    // 1. Update Player stats (maxHandSize, etc)
    Object.values(state.players).forEach((player) => {
      // Reset to base
      player.maxHandSize = 7;

      // Apply modifiers from rule registry
      const relevantEffects = state.ruleRegistry.continuousEffects.filter(
        (e) =>
          e.playerModifier &&
          this.isTarget(state, e, player.id) &&
          (!e.condition ||
            ConditionProcessor.matchesCondition(state, e.condition, {
              sourceId: e.sourceId,
              controllerId: e.controllerId,
            })),
      );

      relevantEffects.forEach((e) => {
        if (e.playerModifier?.maxHandSize !== undefined) {
          player.maxHandSize = Math.max(
            player.maxHandSize,
            e.playerModifier.maxHandSize,
          );
        }
      });
    });

    // 2. Update Battlefield objects
    state.battlefield.forEach((obj) => {
      const stats = this.getEffectiveStats(obj, state, undefined, activeEffects);

      // --- SUMMONING SICKNESS & HASTE FIX ---
      // CR 302.6: Haste allows creatures to bypass summoning sickness.
      // We clear the sickness property so that both backend logic and frontend UI (ZZZ tag)
      // correctly identify that the creature is ready.
      const isCreature = obj.definition.types.some(
        (t) => t.toLowerCase() === "creature",
      );
      if (isCreature && obj.summoningSickness) {
        const hasHaste = stats.keywords.some(
          (k: string) => k.toLowerCase() === "haste",
        );
        if (hasHaste) {
          obj.summoningSickness = false;
        }
      }

      obj.effectiveStats = {
        ...stats,
        isPlayable:
          state.priorityPlayerId === obj.controllerId &&
          PriorityProcessor.canObjectBePlayed(state, obj.controllerId, obj.id),
      };
    });

    // 2. Update Hand, Graveyard, and Library cards
    Object.values(state.players).forEach((player) => {
      player.virtualHand = [];
      player.graveyard.forEach((card: GameObject) => {
        const stats = this.getEffectiveStats(card, state, undefined, activeEffects);
        const hasPermission = PriorityProcessor.findPermissionEffect(
          state,
          player.id,
          "AllowCastFromGraveyard",
          card.id,
        );
        const hasFlashback =
          (stats.keywords || []).some(
            (k: string) => k.toLowerCase() === "flashback",
          ) ||
          (card.definition.keywords || []).some(
            (k: string) => k.toLowerCase() === "flashback",
          );

        const hasGraveyardAbility = (card.definition.abilities || []).some(
          (a) => {
            if (typeof a === 'string') return false;
            return (a.type === AbilityType.Activated) &&
              a.activeZone === Zone.Graveyard;
          }
        );

        if (hasPermission || hasFlashback || hasGraveyardAbility) {
          player.virtualHand.push(card);
        }
      });

      state.exile.forEach((card) => {
        const hasPermission = PriorityProcessor.findPermissionEffect(
          state,
          player.id,
          "AllowPlayExiled",
          card.id,
        );
        if (hasPermission) {
          player.virtualHand.push(card);
        }
      });

      // Revealed status for public information
      player.virtualHand.forEach((card: GameObject) => {
        card.isRevealed = true;
      });

      // Top of library
      if (player.library.length > 0) {
        const topCard = player.library[player.library.length - 1];
        const hasPermission = PriorityProcessor.findPermissionEffect(
          state,
          player.id,
          "AllowPlayFromTop",
          topCard.id,
        );
        if (hasPermission) {
          player.virtualHand.push(topCard);
        }
      }

      // 3. Search for Prepared Creatures on Battlefield
      // If a creature is prepared, we add its prepared face to the virtual hand to allow casting it from the battlefield.
      state.battlefield.forEach((o) => {
        if (
          o.controllerId === player.id &&
          o.isPrepared &&
          (o.definition.preparedFace || o.definition.faces?.[1])
        ) {
          const face = o.definition.preparedFace || o.definition.faces![1];
          // Create a virtual spell copy in the hand
          const virtualSpell: GameObject = {
            ...o,
            id: `virtual_prepared_${o.id}`,
            definition: {
              ...face,
              image_url: face.image_url || o.definition.image_url,
            },
            zone: Zone.Hand,
            isVirtual: true,
            isRevealed: true,
          };
          player.virtualHand.push(virtualSpell);
        }
      });
    });

    // 3. Evaluate playability ONLY for objects the player can interact with (Hand, Virtual Hand)
    if (!SpellProcessor) {
      const { spell: SP } = getProcessors(state);
      SpellProcessor = SP;
    }

    [
      ...Object.values(state.players).flatMap((p) => [
        ...p.hand,
        ...p.virtualHand,
        ...p.graveyard,
      ]),
      ...state.exile
    ].forEach((obj) => {
      // NOTE: We pass activeEffects to avoid O(N^2) continuous effect scanning
      const stats = this.getEffectiveStats(obj, state, undefined, activeEffects);

      const isVirtual = Object.values(state.players).some((p) =>
        p.virtualHand.some((v) => v.id === obj.id),
      );
      
      const inGraveyard =
        obj.zone === Zone.Graveyard ||
        Object.values(state.players).some((p) =>
          p.graveyard.some((g) => g.id === obj.id),
        );

      const hasFlashbackKeyword =
        (stats.keywords || []).some(
          (k: string) => k.toLowerCase() === "flashback",
        ) ||
        (obj.definition.keywords || []).some(
          (k: string) => k.toLowerCase() === "flashback",
        ) ||
        obj.definition.oracleText?.toLowerCase().includes("flashback");

      const graveyardAbility = (obj.definition.abilities || []).find(
        (a): a is any => {
          if (typeof a === 'string') return false;
          return (a.type === "ActivatedAbility") &&
            a.activeZone === Zone.Graveyard;
        }
      );

      const isFlashback = !!hasFlashbackKeyword && (inGraveyard || isVirtual);
      const isActivation = !!graveyardAbility && (inGraveyard || isVirtual);

      let isPlayable = false;
      let displayCost = obj.definition.manaCost;

      // FAST PATH: isPlayable requires expensive restriction matching, only do it if the object is owned by the active player
      if (state.priorityPlayerId === obj.controllerId) {
          let currentDisplayCost = obj.definition.manaCost;
          if (isFlashback) {
            currentDisplayCost =
              obj.definition.flashbackCost ||
              (obj.definition as any).flashback_cost ||
              obj.definition.manaCost;
          } else if (isActivation && graveyardAbility) {
            currentDisplayCost =
              graveyardAbility.manaCost ||
              graveyardAbility.costs?.find((c: any) => c.type === "Mana")?.value ||
              obj.definition.manaCost;
          }

          try {
            if (SpellProcessor) {
              const { totalMana } = SpellProcessor.getEffectiveCosts(
                state,
                obj,
                [],
                undefined,
                isFlashback,
                stats,
              );
              currentDisplayCost = totalMana;
            }
          } catch (e) {
          }

          displayCost = currentDisplayCost;
          isPlayable = PriorityProcessor.canObjectBePlayed(state, obj.controllerId, obj.id, true, stats, displayCost);
      }

      obj.effectiveStats = {
        ...stats,
        isPlayable,
        manaCost: displayCost,
        isFlashback,
        isActivation,
        isVirtual,
      };
    });
  }
}
