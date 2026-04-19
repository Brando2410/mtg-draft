import {
    AbilityType,
    ContinuousEffect,
    GameObject, GameState, Zone
} from "@shared/engine_types";
import { TargetingProcessor } from "../actions/targeting/TargetingProcessor";
import { ConditionProcessor } from "../core/logic/ConditionProcessor";

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
  ) {
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
      } as any;
    }

    this.calculationStack.add(obj.id);

    try {
      const effects = state.ruleRegistry.continuousEffects || [];

      // 1. FILTER RELEVANT EFFECTS (Rule 613.1)
      const activeEffects = effects.filter((e) => {
        if (e.id?.startsWith("floating_") || e.sourceId === "global")
          return true;
        const source = state.battlefield.find((o) => o.id === e.sourceId);
        if (!source || !e.activeZones.includes(source.zone)) return false;
        if (e.condition) {
          return ConditionProcessor.matchesCondition(state, e.condition, {
            sourceId: e.sourceId,
            controllerId: e.controllerId,
          });
        }
        return true;
      });

      // 2. STAGE 1: Printed values and Layer 1 (Copiable Values - Rule 707)
      let currentDefinition = { ...obj.definition };
      const supertypes = new Set<string>(currentDefinition.supertypes || []);

      const copyEffects = activeEffects.filter((e) => e.layer === 1);
      for (const effect of copyEffects) {
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
            if ((effect as any).isNotLegendary) {
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
      // Note: In this engine, Layer 2 is often handled directly in ActionProcessor,
      // but we maintain the order for future standardization.

      // 3. LAYER 3: Text-changing effects (Rule 613.1c)
      // (Reserved for future implementation)

      // 4. LAYER 4: Type-changing effects (Rule 613.1d)
      activeEffects
        .filter((e) => e.layer === 4 || e.typesToAdd || e.typesSet)
        .forEach((e) => {
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
      activeEffects
        .filter((e) => e.layer === 5 || e.colorsToAdd || e.colorSet)
        .forEach((e) => {
          if (!this.isTarget(state, e, obj.id)) return;
          e.colorsToAdd?.forEach((c) => colors.add(c));
          if (e.colorSet) {
            colors.clear();
            e.colorSet.forEach((c) => colors.add(c));
          }
        });

      // 6. LAYER 6: Ability Adding/Removing (Rule 613.1f)
      activeEffects
        .filter(
          (e) =>
            e.layer === 6 ||
            e.abilitiesToAdd ||
            e.abilitiesToRemove ||
            e.removeAllAbilities,
        )
        .forEach((e) => {
          if (!this.isTarget(state, e, obj.id)) return;
          if (e.removeAllAbilities) {
            keywords.clear();
          }
          e.abilitiesToAdd?.forEach((k: any) => {
            const keyword =
              typeof k === "string" ? k : (k as any).name || "Unknown";
            keywords.add(keyword);
          });
          e.abilitiesToRemove?.forEach((k) => keywords.delete(k));
        });

      // 7. LAYER 7: Power and/or toughness-changing effects (Rule 613.1g)

      // 7a: Characteristic-defining abilities (Rule 613.4a)
      activeEffects
        .filter((e) => e.powerDynamic || e.toughnessDynamic)
        .forEach((e) => {
          if (!this.isTarget(state, e, obj.id)) return;
          this.applyLayer7(state, e, obj, (p, t) => {
            if (p !== undefined) power = p;
            if (t !== undefined) toughness = t;
          });
        });

      // 7b: Effects that set P/T (Rule 613.4b)
      activeEffects
        .filter((e) => e.powerSet !== undefined || e.toughnessSet !== undefined)
        .forEach((e) => {
          if (!this.isTarget(state, e, obj.id)) return;
          this.applyLayer7(state, e, obj, (p, t) => {
            if (p !== undefined) power = p;
            if (t !== undefined) toughness = t;
          });
        });

      // 7c: Modifiers and Counters (Rule 613.4c)
      activeEffects
        .filter(
          (e) =>
            e.powerModifier !== undefined || e.toughnessModifier !== undefined,
        )
        .forEach((e) => {
          if (!this.isTarget(state, e, obj.id)) return;
          const { EffectProcessor } = require("../effects/EffectProcessor");
          let pMod = 0;
          let tMod = 0;

          if (e.powerModifier !== undefined) {
            pMod = EffectProcessor.resolveAmount(
              state,
              e.powerModifier,
              e.sourceId,
              e.controllerId,
              undefined,
              e.targetIds || [obj.id],
            );
          }
          if (e.toughnessModifier !== undefined) {
            tMod = EffectProcessor.resolveAmount(
              state,
              e.toughnessModifier,
              e.sourceId,
              e.controllerId,
              undefined,
              e.targetIds || [obj.id],
            );
          }

          const multiplier =
            (e as any).multiplier !== undefined ? (e as any).multiplier : 1;
          power += pMod * multiplier;
          toughness += tMod * multiplier;
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
      if ((obj as any).isPTSwitched) {
        const temp = power;
        power = toughness;
        toughness = temp;
      }

      // Collect structured restrictions
      const structuredRestrictions = activeEffects
        .filter((e) => this.isTarget(state, e, obj.id))
        .flatMap((e) => e.restrictions || [])
        .map((r: any) => {
            if (typeof r === "string") {
                return { type: r } as any;
            }
            return r;
        });

      return {
        power,
        toughness,
        keywords: Array.from(keywords),
        colors: Array.from(colors),
        types: Array.from(types),
        subtypes: Array.from(subtypes),
        restrictions: structuredRestrictions,
        flashbackCostOverride: activeEffects.find(
          (e) =>
            this.isTarget(state, e, obj.id) && (e as any).flashbackCostOverride,
        )?.flashbackCostOverride,
        isPlayable: false,
        supertypes: Array.from(supertypes),
      };
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
      (effect as any).powerDynamic === "INSTANTS_AND_SORCERIES_IN_GRAVEYARD"
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

    if ((effect as any).powerDynamic === "GREATEST_POWER_IN_GRAVEYARD") {
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
          return !!source && (source as any).attachedTo === objId;
        }
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
    return this.getEffectiveKeywords(obj, state).includes(keyword);
  }
  /**
   * Batch updates all derived fields (P/T, Keywords, isPlayable) for all relevant objects.
   * This should be called after any rule-changing event or zone transition.
   */
  public static updateDerivedStats(state: GameState, PriorityProcessor: any) {
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
      const stats = this.getEffectiveStats(obj, state);

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
    (Object.values(state.players) as any[]).forEach((player) => {
      player.virtualHand = [];
      player.graveyard.forEach((card: GameObject) => {
        const stats = this.getEffectiveStats(card, state);
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

        const hasGraveyardAbility = card.definition.abilities?.some(
          (a: any) =>
            (a.type === AbilityType.Activated || a.type === "Activated") &&
            (a.zone === Zone.Graveyard ||
              a.activeZone === Zone.Graveyard ||
              a.activeZone === Zone.Graveyard),
        );

        if (hasPermission || hasFlashback || hasGraveyardAbility) {
          player.virtualHand.push(card);
        }
      });

      state.exile.forEach((card) => {
        if (card.controllerId === player.id) {
          const hasPermission = PriorityProcessor.findPermissionEffect(
            state,
            player.id,
            "AllowPlayExiled",
            card.id,
          );
          if (hasPermission) {
            player.virtualHand.push(card);
          }
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
          const virtualSpell = {
            ...o,
            id: `virtual_prepared_${o.id}`,
            definition: {
              ...face,
              image_url: face.image_url || o.definition.image_url,
            },
            zone: Zone.Hand,
            isVirtual: true,
            isRevealed: true,
            sourceCreatureId: o.id,
          };
          player.virtualHand.push(virtualSpell as any);
        }
      });
    });

    // 3. Update effective stats for all objects in all zones (to set isPlayable correctly)
    const { SpellProcessor } = require("../actions/spells/SpellProcessor");
    [
      ...state.stack.map((s) => s.card).filter(Boolean),
      ...state.battlefield,
      ...(Object.values(state.players) as any[]).flatMap((p) => [
        ...p.hand,
        ...p.graveyard,
        ...p.library,
        ...p.virtualHand,
      ]),
      ...state.exile,
    ].forEach((obj) => {
      const stats = this.getEffectiveStats(obj, state);
      const isPlayable =
        state.priorityPlayerId === obj.controllerId &&
        PriorityProcessor.canObjectBePlayed(state, obj.controllerId, obj.id);

      // Determine if this object is currently a Flashback candidate for cost display
      const isVirtual = (Object.values(state.players) as any[]).some((p) =>
        p.virtualHand.some((v: any) => v.id === obj.id),
      );
      const inGraveyard =
        obj.zone === Zone.Graveyard ||
        (Object.values(state.players) as any[]).some((p) =>
          p.graveyard.some((g: any) => g.id === obj.id),
        );

      const hasFlashbackKeyword =
        (stats.keywords || []).some(
          (k: string) => k.toLowerCase() === "flashback",
        ) ||
        (obj.definition.keywords || []).some(
          (k: string) => k.toLowerCase() === "flashback",
        ) ||
        obj.definition.oracleText?.toLowerCase().includes("flashback");

      const graveyardAbility = obj.definition.abilities?.find(
        (a: any) =>
          (a.type === AbilityType.Activated || a.type === "Activated") &&
          (a.zone === Zone.Graveyard ||
            a.activeZone === Zone.Graveyard ||
            a.activeZone === Zone.Graveyard),
      );

      const isFlashback = hasFlashbackKeyword && (inGraveyard || isVirtual);
      const isActivation = !!graveyardAbility && (inGraveyard || isVirtual);

      // Calculate effective mana cost for display
      let displayCost = obj.definition.manaCost;
      if (isFlashback) {
        displayCost =
          obj.definition.flashbackCost ||
          (obj.definition as any).flashback_cost ||
          obj.definition.manaCost;
      } else if (isActivation && graveyardAbility) {
        displayCost =
          (graveyardAbility as any).manaCost ||
          (graveyardAbility as any).costs?.find((c: any) => c.type === "Mana")
            ?.value ||
          obj.definition.manaCost;
      }

      // Try to get more accurate cost from SpellProcessor if available
      try {
        const { totalMana } = SpellProcessor.getEffectiveCosts(
          state,
          obj,
          [],
          undefined,
          isFlashback,
          stats,
        );
        displayCost = totalMana;
      } catch (e) {
        // fallback to base displayCost calculated above
      }

      obj.effectiveStats = {
        ...stats,
        isPlayable,
        manaCost: displayCost,
        isFlashback,
        isActivation,
        isVirtual,
      };
      (obj as any).isVirtual = isVirtual;
    });
  }
}
