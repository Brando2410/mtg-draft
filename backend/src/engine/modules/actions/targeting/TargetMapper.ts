import {
  ActivatedAbility,
  EffectDefinition,
  GameState,
  PreventionEffect, ReplacementEffect, EngineFrame,
  Restriction,
  TargetDefinition, TargetRestriction, TargetType, TriggeredAbility
} from "@shared/engine_types";
import { getProcessors } from "../../ProcessorRegistry";
import { TargetMappingRegistry } from "./TargetMappingRegistry";
import { LogCategory } from "../../../utils/EngineLogger";

export class TargetMapper {
  public static getCountsForDefinition(d: TargetDefinition | null, xValue: number = 0): { maxCount: number; minCount: number; count: number } {
    if (!d) return { maxCount: 0, minCount: 0, count: 0 };

    let count: number | string | { min: number; max: number } | undefined = d.count;
    let dMin: number | string | undefined = d.minCount;
    let dMax: number | string | undefined = d.maxCount;

    if (typeof count === "object" && count !== null && "min" in count) {
      dMin = count.min;
      dMax = count.max;
      count = dMax;
    } else if (count === "ANY") {
      dMin = 0;
      dMax = 999;
      count = 999;
    }

    const resolveVal = (val: number | string | { min: number; max: number } | undefined, def: number): number => {
      if (val === "X") return xValue;
      if (val === "ANY") return 999;
      if (typeof val === "number") return val;
      if (typeof val === "object" && val !== null && "max" in val) return val.max;
      return def;
    };

    const resolvedCount = resolveVal(count, 1);
    const resolvedMax = dMax !== undefined && dMax !== null ? resolveVal(dMax, resolvedCount) : resolvedCount;
    const resolvedMin = dMin !== undefined && dMin !== null ? resolveVal(dMin, resolvedCount) : (d.optional ? 0 : resolvedCount);

    return {
      maxCount: resolvedMax,
      minCount: resolvedMin,
      count: resolvedCount
    };
  }

  public static calculateTotalCounts(
    targetDefinitions: TargetDefinition[],
    xValue: number = 0,
  ): { maxCount: number; minCount: number; count: number } {
    let maxCount = 0;
    let minCount = 0;
    let targetCount = 0;

    targetDefinitions.forEach((d) => {
      const counts = this.getCountsForDefinition(d, xValue);
      maxCount += counts.maxCount;
      minCount += counts.minCount;
      targetCount += counts.count;
    });

    return { maxCount, minCount, count: targetCount };
  }

  public static generateTargetPrompt(
    targetDefinitions: TargetDefinition[],
    selectedCount: number,
    xValue: number = 0,
    isSpellCasting: boolean = false,
  ): string {
    const def = this.getDefinitionForIndex(targetDefinitions, selectedCount);
    if (!def) return "Select targets";

    const currentCounts = this.calculateTotalCounts([def], xValue);
    const globalCounts = this.calculateTotalCounts(targetDefinitions, xValue);

    const isRulesOptional = def.optional || def.minCount === 0;
    const isSequenceOptional = globalCounts.minCount <= selectedCount;

    const type = (def.type || "target").toString().toLowerCase();
    const rawRestrictions = def.restrictions || [];
    const restrictions = rawRestrictions.map((r: TargetRestriction) =>
      typeof r === "string" ? r.toLowerCase() : r,
    );

    let typeStr = "";

    if (restrictions.includes("opponent") || type === "opponent") {
      typeStr = "an opponent";
    } else if (restrictions.includes("you") || type === "self") {
      typeStr = "yourself";
    } else if (type === "player") {
      typeStr = "a player";
    } else if (type === TargetType.AnyTarget.toLowerCase()) {
      typeStr = "any target";
    } else {
      // Complex object labeling based on type & restrictions
      let adjectives: string[] = [];
      let mainNoun = "target";
      let location = "";

      // Mapping for base types (handles both shorthand strings and internal enum names)
      const baseTypeMap: Record<string, string> = {
        [Restriction.Creature]: "creature",
        [Restriction.Artifact]: "artifact",
        [Restriction.Land]: "land",
        [Restriction.Enchantment]: "enchantment",
        [Restriction.Planeswalker]: "planeswalker",
        [Restriction.Permanent]: "permanent",
        [Restriction.Spell]: "spell",
        [Restriction.Card]: "card",
        [TargetType.CardInGraveyard.toLowerCase()]: "card",
        [TargetType.CardInHand.toLowerCase()]: "card",
        [TargetType.CardInExile.toLowerCase()]: "card",
        [TargetType.SpellOrPermanent.toLowerCase()]: "spell or permanent",
        [TargetType.NonlandPermanent.toLowerCase()]: "nonland permanent",
        [Restriction.InstantOrSorcery]: "instant or sorcery card",
        [TargetType.PlayerOrPlaneswalker.toLowerCase()]: "player or planeswalker",
        [Restriction.ArtifactOrCreature]: "artifact or creature",
        [Restriction.ArtifactOrEnchantment]: "artifact or enchantment",
        [Restriction.CreatureOrPlaneswalker]: "creature or planeswalker",
      };

      mainNoun = baseTypeMap[type] || type;

      if (type.includes("graveyard")) location = "in any graveyard";
      if (type.includes("hand")) location = "in hand";
      if (type.includes("exile")) location = "in exile";

      const knownAdjectives = [
        Restriction.Other,
        Restriction.NonLand,
        Restriction.NonCreature,
        Restriction.Token,
        Restriction.NonToken,
        Restriction.Legendary,
        Restriction.Tapped,
        Restriction.Untapped,
        Restriction.Monocolored,
        Restriction.Multicolored,
        Restriction.Colorless,
        Restriction.White,
        Restriction.Blue,
        Restriction.Black,
        Restriction.Red,
        Restriction.Green,
      ];

      const baseTypes = [
        Restriction.Creature,
        Restriction.Artifact,
        Restriction.Land,
        Restriction.Enchantment,
        Restriction.Planeswalker,
        Restriction.Permanent,
        Restriction.Spell,
        Restriction.Card,
      ];

      for (const r of restrictions) {
        if (typeof r !== "string") continue;
        const lr = r.toLowerCase();

        // 1. Basic Adjectives
        if ((knownAdjectives as string[]).includes(lr)) {
          if (lr === Restriction.Other)
            adjectives.unshift("another"); // "Another" always comes first
          else adjectives.push(lr);
          continue;
        }

        // 2. Type overrides or subtype as adjective
        if ((baseTypes as string[]).includes(lr)) {
          if (
            mainNoun === "card" ||
            mainNoun === "target" ||
            mainNoun === "permanent"
          ) {
            mainNoun = lr + (mainNoun === "card" ? " card" : "");
          }
        } else if (lr === Restriction.Instant || lr === Restriction.Sorcery) {
          mainNoun = lr + " card";
        } else if (lr === Restriction.InstantOrSorcery) {
          mainNoun = "instant or sorcery card";
        } else if (
          !lr.includes("control") &&
          !lr.includes("yours") &&
          !lr.includes("opponents") &&
          lr !== "graveyard"
        ) {
          // Assume it's a subtype (e.g., "Spirit", "Elf")
          adjectives.push(r); // Use original casing for subtypes if available, though here it's already lower
        }

        // 3. Ownership / Specific location
        if (lr === Restriction.YouControl || lr === Restriction.YouOwn) {
          if (location.includes("graveyard")) location = "in your graveyard";
          else if (location.includes("hand")) location = "in your hand";
          else if (location.includes("exile")) location = "in your exile";
          else location = "you control";
        } else if (
          lr === Restriction.OpponentControl ||
          lr === Restriction.OpponentOwns
        ) {
          if (location.includes("graveyard"))
            location = "in an opponent's graveyard";
          else if (location.includes("hand"))
            location = "in an opponent's hand";
          else if (location.includes("exile"))
            location = "in an opponent's exile";
          else location = "an opponent controls";
        } else if (lr === "graveyard" && !location) {
          location = "in any graveyard";
        } else if (lr === "exile" && !location) {
          location = "in exile";
        }
      }

      // Assemble the phrase
      // Sort adjectives to maintain "another" at the start
      const finalAdjectives = [...new Set(adjectives)];
      const adjStr = finalAdjectives.join(" ");

      if (adjStr.includes("another")) {
        typeStr = `${adjStr} ${mainNoun}`;
      } else {
        const combined = adjStr ? `${adjStr} ${mainNoun}` : mainNoun;
        const firstChar = combined[0].toLowerCase();
        const prefix = "aeiou".includes(firstChar) ? "an" : "a";
        typeStr = `${prefix} ${combined}`;
      }

      if (location) {
        typeStr += ` ${location}`;
      }
    }

    // If the definition specifies a label, use it!
    if (def.label) {
      let label = def.label;
      if (
        label.toLowerCase().trim().endsWith("to") ||
        label.toLowerCase().trim().endsWith("select")
      ) {
        label = `${label.trim()} ${typeStr}`;
      }

      if (
        isRulesOptional &&
        !label.toLowerCase().includes("may") &&
        !label.toLowerCase().includes("optional")
      ) {
        return `You may ${label.toLowerCase().startsWith("select") ? label : `select ${label.toLowerCase()}`}`;
      }
      return label;
    }

    // Handle "Up to" phrasing
    if (def.minCount === 0 && (typeof def.count === 'number' ? def.count > 0 : !!def.count)) {
      const countStr = def.count === 1 ? "one" : String(def.count);
      let cleanType = typeStr;
      if (cleanType.startsWith("a ")) cleanType = cleanType.substring(2);
      if (cleanType.startsWith("an ")) cleanType = cleanType.substring(3);
      const finalType =
        (typeof def.count === 'number' && def.count > 1) || def.count === "X"
          ? this.pluralize(cleanType)
          : cleanType;
      const prefix = isSequenceOptional
        ? "You may select up to"
        : "Select up to";
      return `${prefix} ${countStr} target ${finalType}`;
    }

    let finalTypeStr = typeStr;
    if (finalTypeStr.startsWith("a ")) finalTypeStr = finalTypeStr.substring(2);
    else if (finalTypeStr.startsWith("an "))
      finalTypeStr = finalTypeStr.substring(3);

    const totalMax = currentCounts.maxCount;
    const needsCount = totalMax > 1 && !isSequenceOptional;
    const basePrefix =
      isRulesOptional || (isSequenceOptional && !isSpellCasting)
        ? "You may select"
        : "Select";

    if (finalTypeStr === "any target") {
      if (needsCount) return `${basePrefix} ${totalMax} targets`;
      return `${basePrefix} target`;
    }

    if (needsCount) {
      return `${basePrefix} ${totalMax} target ${this.pluralize(finalTypeStr)}`;
    }

    return `${basePrefix} target ${finalTypeStr}`;
  }

  private static pluralize(str: string): string {
    if (!str || str.endsWith("s")) return str;
    if (
      str.endsWith("y") &&
      !str.endsWith("ay") &&
      !str.endsWith("ey") &&
      !str.endsWith("oy") &&
      !str.endsWith("uy")
    ) {
      return str.substring(0, str.length - 1) + "ies";
    }
    return str + "s";
  }

  /**
   * CR 114: Resolve target mapping for effects.
   */
  public static resolveTargetMapping(
    state: GameState,
    mapping: string,
    context: EngineFrame,
    effect?: Partial<EffectDefinition> | ActivatedAbility | TriggeredAbility | ReplacementEffect | PreventionEffect,
  ): string[] {
    return this.doResolveTargetMapping(state, mapping, context, effect);
  }

  private static doResolveTargetMapping(
    state: GameState,
    mapping: string,
    context: EngineFrame,
    effect?: Partial<EffectDefinition> | ActivatedAbility | TriggeredAbility | ReplacementEffect | PreventionEffect,
  ): string[] {
    const { sourceId, targets } = context;
    const { logger } = getProcessors(state);

    // Extract common mapping properties from the effect payload to avoid repetitive casting
    const payload = effect as (Partial<EffectDefinition> & { targetOffset?: number });
    const targetOffset = payload?.targetOffset || 0;

    logger.debug(state, LogCategory.TARGETING, `[TARGET-MAP] Mapping ${mapping} for source ${sourceId}. Context targets: ${targets?.join(', ')}`);

    // Centralized target resolution: Prioritize originalTargets if we are in an effect handler 
    // that has already resolved its victims, otherwise fall back to context targets.
    const resolvedTargets = (context.originalTargets && context.originalTargets.length > 0)
      ? context.originalTargets
      : (targets && targets.length > 0)
        ? targets
        : (context.stackObject?.targets || []);

    // Check TargetMappingRegistry (The modular system)
    const handler = TargetMappingRegistry[mapping.toUpperCase()];
    if (handler) {
      return handler.resolve({
        state,
        mapping,
        context: { ...context, targets: resolvedTargets },
        effect,
        targetOffset
      });
    }

    logger.warn(state, LogCategory.TARGETING, `[TARGET-MAP-WARN] No handler registered for mapping: ${mapping}`);
    return [];
  }

  public static getDefinitionForIndex(
    targetDefinitions: TargetDefinition[],
    targetIndex: number,
    xValue: number = 0
  ): TargetDefinition | null {
    let cumulative = 0;
    for (const d of targetDefinitions) {
      const counts = this.calculateTotalCounts([d], xValue);
      const count = counts.maxCount;
      if (targetIndex >= cumulative && targetIndex < cumulative + count) {
        return d;
      }
      cumulative += count;
    }
    return targetDefinitions[targetDefinitions.length - 1] || null;
  }
}
