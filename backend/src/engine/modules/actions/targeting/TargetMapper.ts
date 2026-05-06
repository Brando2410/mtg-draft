import {
  ActivatedAbility,
  EffectDefinition,
  GameObject, GameState,
  PlayerId, PreventionEffect, ReplacementEffect, ResolutionContext,
  Restriction,
  TargetingContext, TargetDefinition, TargetMapping, TargetRestriction, TargetType, TriggeredAbility, Zone
} from "@shared/engine_types";
import { RuleUtils } from "../../../utils/RuleUtils";
import { getProcessors } from "../../ProcessorRegistry";
import { TargetMappingRegistry } from "./TargetMappingRegistry";
import { LogCategory } from "../../../utils/EngineLogger";
import { ManaProcessor } from "../../magic/ManaProcessor";
import { TargetValidator } from "./TargetValidator";


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
    context: ResolutionContext,
    effect?: Partial<EffectDefinition> | ActivatedAbility | TriggeredAbility | ReplacementEffect | PreventionEffect,
  ): string[] {
    return this.doResolveTargetMapping(state, mapping, context, effect);
  }

  private static doResolveTargetMapping(
    state: GameState,
    mapping: string,
    context: ResolutionContext,
    effect?: Partial<EffectDefinition> | ActivatedAbility | TriggeredAbility | ReplacementEffect | PreventionEffect,
  ): string[] {
    const { sourceId, controllerId, stackObject, targets, parentContext } =
      context;
    const { logger } = getProcessors(state);

    // Extract common mapping properties from the effect payload to avoid repetitive casting
    const payload = effect as (Partial<EffectDefinition> & { targetOffset?: number; linkKey?: string; restrictions?: TargetRestriction[]; sourceZones?: Zone[] });
    const targetOffset = payload?.targetOffset || 0;
    const linkKey = payload?.linkKey || "linkedCardId";
    const restrictions = payload?.restrictions || [];
    const sourceZones = payload?.sourceZones;

    logger.debug(state, LogCategory.TARGETING, `[TARGET-MAP] Mapping ${mapping} for source ${sourceId}. Context targets: ${targets?.join(', ')}`);
    const targetingContext: TargetingContext = {
      sourceId,
      controllerId,
      stackObject,
      xValue: context.xValue || stackObject?.xValue || 0,
    };

    // Centralized target resolution: Prioritize context targets (current resolution) 
    // over stack object targets (original declaration).
    const resolvedTargets = (targets && targets.length > 0)
      ? targets
      : (stackObject?.targets || []);

    const eventData =
      context.event ||
      parentContext?.event ||
      stackObject?.event;

    // 1. Check TargetMappingRegistry (New modular system)
    const eData = eventData;
    if (mapping.toUpperCase() === 'TRIGGER_EVENT_SOURCE') {
        logger.debug(state, LogCategory.TARGETING, `[TRIGGER-MAP-DEBUG] TriggerEventSource Resolution: eventData present=${!!eData}, type=${eData?.type}, sourceId=${RuleUtils.getSource(eData)}`);
    }

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

    // 2. Legacy Switch (Fallback for remaining mappings)
    switch (mapping.toUpperCase()) {
      case TargetMapping.LinkedObject: {
        const lSource = RuleUtils.findObject(state, sourceId);
        if (RuleUtils.isEntity(lSource)) {
          return lSource.data?.[linkKey] ? [lSource.data[linkKey]] : [];
        }
        return [];
      }
      case TargetMapping.EnchantedCreature:
      case TargetMapping.EnchantedPermanent: {
        const aura = RuleUtils.findObject(state, sourceId);
        if (RuleUtils.isGameObject(aura)) {
          return aura.attachedTo ? [aura.attachedTo] : [];
        }
        return [];
      }
      case TargetMapping.LastCreatedToken:
        return state.turnState.lastCreatedTokenId
          ? [state.turnState.lastCreatedTokenId]
          : [];
      case TargetMapping.LastExiledIds:
        return state.turnState.lastExiledIds || [];
      case TargetMapping.ParentContextExiledIds: {
        const result = (context.exiledIds && context.exiledIds.length > 0) ? context.exiledIds : (parentContext?.exiledIds || []);
        return result;
      }
      case TargetMapping.ParentContextExiledIdsOwners: {
        const ids = (context.exiledIds && context.exiledIds.length > 0) ? context.exiledIds : (parentContext?.exiledIds || []);
        const owners = ids
          .map(
            (id: string) =>
              RuleUtils.findObject(state, id)?.ownerId,
          )
          .filter((id): id is string => !!id);
        return [...new Set(owners)];
      }
      case TargetMapping.Target1Owner: {
        const targetId = resolvedTargets[0];
        const obj = RuleUtils.findObject(state, targetId);
        return obj ? [obj.ownerId] : [];
      }
      case TargetMapping.SelfAndTarget1: {
        const offset = targetOffset;
        return resolvedTargets[offset] ? [sourceId, resolvedTargets[offset]] : [sourceId];
      }
      case TargetMapping.TargetAll:
        return resolvedTargets.filter(Boolean);

      case TargetMapping.TriggerEventSource:
      case TargetMapping.EventSource:
      case TargetMapping.TriggerSource: {
        const eData = eventData;
        const sourceIdFromPayload = RuleUtils.getSource(eData);
        if (sourceIdFromPayload) {
            logger.debug(state, LogCategory.TARGETING, `[TRIGGER-MAP-DEBUG] Found sourceId in payload: ${sourceIdFromPayload}`);
            return [sourceIdFromPayload];
        }

        const obj = RuleUtils.getEventObject(eData, state);
        if (obj) {
            logger.debug(state, LogCategory.TARGETING, `[TRIGGER-MAP-DEBUG] Found event object: ${obj.id}`);
            return [obj.id];
        }

        logger.debug(state, LogCategory.TARGETING, `[TRIGGER-MAP-DEBUG] Fallback to stackObject.sourceId: ${stackObject?.sourceId}`);
        return stackObject?.sourceId ? [stackObject.sourceId] : [];
      }
      case TargetMapping.TriggerTarget: {
        const eData = eventData;
        const obj = RuleUtils.getEventObject(eData, state);
        return obj ? [obj.id] : [];
      }
      case TargetMapping.EventTarget: {
        const eData = eventData;
        const obj = RuleUtils.getEventObject(eData, state);
        return obj ? [obj.id] : [];
      }
      case TargetMapping.EventPlayer: {
        const eData = eventData;
        const pId = eData?.payload?.playerId || eData?.playerId;
        return pId ? [pId as string] : [];
      }
      case TargetMapping.EventObjectController: {
        const eData = eventData;
        const obj = RuleUtils.getEventObject(eData, state);
        return obj ? [RuleUtils.getController(obj)] : [];
      }
      case TargetMapping.Target1Controller: {
        const targetId = resolvedTargets[0];
        // Check if we have persisted controller information first
        if (
          stackObject?.targetsControllers &&
          stackObject.targetsControllers[0]
        ) {
          return [stackObject.targetsControllers[0]];
        }
        if (state.players[targetId as PlayerId]) return [targetId];
        const obj = RuleUtils.findObject(state, targetId);
        return obj ? [RuleUtils.getController(obj)] : [];
      }
      case TargetMapping.TriggerTargetController: {
        const eData = eventData;
        const obj = RuleUtils.getEventObject(eData, state);
        return obj ? [RuleUtils.getController(obj)] : [];
      }
      case TargetMapping.Opponent:
      case TargetMapping.EachOpponent:
      case TargetMapping.Opponents:
        return Object.keys(state.players).filter((pid) => pid !== controllerId);
      case TargetMapping.Opponent1:
      case TargetMapping.TargetOpponent:
        return [Object.keys(state.players).filter((pid) => pid !== controllerId)[0]];
      case TargetMapping.EachPlayer:
      case TargetMapping.AllPlayers:
        return Object.keys(state.players);
      case TargetMapping.SelectedCard:
      case TargetMapping.SelectedCards:
      case TargetMapping.AnyTarget:
        return resolvedTargets;
      case TargetMapping.ControllerGraveyardAndLibrary: {
        const pc = state.players[controllerId];
        return pc ? [...pc.graveyard.map((c) => c.id), ...pc.library.map((c) => c.id)] : [];
      }
      case TargetMapping.LastExiledObject:
      case TargetMapping.LastExiledIds:
        return state.turnState.lastExiledIds || [];
      case TargetMapping.LastDiscardedCards:
        return state.turnState.lastDiscardedIds || [];

      // Consolidate all Pool-Based Matching
      case TargetMapping.AllPlaneswalkersYouControl:
      case TargetMapping.AllCreaturesYouControl:
      case TargetMapping.EachCreatureYouControl:
      case TargetMapping.OtherCreaturesYouControl:
      case TargetMapping.OtherSpiritsYouControl:
      case TargetMapping.AllPermanentsYouControl:
      case TargetMapping.AllLandsYouControl:
      case TargetMapping.AllFractalsYouControl:
      case TargetMapping.OtherCreatures:
      case TargetMapping.AllOtherCreatures:
      case TargetMapping.EachOpponentCreature:
      case TargetMapping.AllCreaturesControlledByTarget1:
      case TargetMapping.OtherCreaturesAndPlaneswalkers:
      case TargetMapping.AllCreaturesAndPlaneswalkers:
      case TargetMapping.OtherPlaneswalkersYouControl:
      case TargetMapping.AllMatchingCards:
      case TargetMapping.MatchingCards:
      case TargetMapping.MatchingPermanents:
      case TargetMapping.AllMatchingPermanents:
      case TargetMapping.MatchingPermanentsYouControl:
      case TargetMapping.AllMatchingPermanentsYouControl: {
        const finalRestrictions = [...restrictions];

        // 1. Determine Implicit Restrictions from Mapping String
        if (mapping.includes('CREATURE_AND_PLANESWALKER')) finalRestrictions.push('creature_or_planeswalker');
        else if (mapping.includes('CREATURE')) finalRestrictions.push(Restriction.Creature);
        else if (mapping.includes('PERMANENT')) finalRestrictions.push(Restriction.Permanent);
        else if (mapping.includes('PLANESWALKER')) finalRestrictions.push(Restriction.Planeswalker);
        else if (mapping.includes('LAND')) finalRestrictions.push(Restriction.Land);

        if (mapping.includes('SPIRIT')) finalRestrictions.push('spirit');
        if (mapping.includes('FRACTAL')) finalRestrictions.push('fractal');
        if (mapping.includes('OTHER')) finalRestrictions.push(Restriction.Other);

        // 2. Handle Control
        let controllerIdToMatch = controllerId;
        if (mapping.includes('CONTROLLED_BY_TARGET1')) {
          const actualTargets = stackObject?.targets?.length ? stackObject.targets : targets;
          controllerIdToMatch = actualTargets[0] as PlayerId;
        }

        if (mapping.includes('YOU_CONTROL')) {
          finalRestrictions.push(Restriction.YouControl);
        } else if (mapping.includes('OPPONENT_CREATURE')) {
          finalRestrictions.push(Restriction.OpponentControls);
        }

        // 3. Determine Source Zones
        const isMatchingType = mapping.includes('MATCHING');
        const effectiveSourceZones = sourceZones || (isMatchingType
          ? [Zone.Battlefield, Zone.Graveyard, Zone.Hand, Zone.Exile, Zone.Library]
          : [Zone.Battlefield]);
        const zones = effectiveSourceZones;

        const pool: string[] = [];
        zones.forEach(z => {
          if (finalRestrictions.includes(Restriction.Permanent) && z !== Zone.Battlefield) return;

          if (z === Zone.Battlefield) pool.push(...state.battlefield.map(o => o.id));
          else if (z === Zone.Exile) pool.push(...state.exile.map(o => o.id));
          else if (z === Zone.Stack) pool.push(...state.stack.map(s => s.id));
          else {
            Object.values(state.players).forEach(p => {
              if (z === Zone.Hand) pool.push(...p.hand.map(c => c.id));
              else if (z === Zone.Graveyard) pool.push(...p.graveyard.map(c => c.id));
              else if (z === Zone.Library) pool.push(...p.library.map(c => c.id));
            });
          }
        });

        const effectiveContext = { ...targetingContext, controllerId: controllerIdToMatch };
        return pool.filter(tid => {
          const obj = RuleUtils.findObject(state, tid);
          return obj && TargetValidator.matchesRestrictions(state, obj, finalRestrictions, effectiveContext);
        });
      }
      case TargetMapping.RemainderOfPool:
      case TargetMapping.RemainderOfLookingCards: {
        const pool = (parentContext?.lookingCards ||
          stackObject?.lookingCards ||
          state.pendingAction?.data?.lookingCards ||
          []) as GameObject[];
        // A card is part of the 'remainder' if it is still in the library (or exile if that's where we look from)
        // whereas selected cards will have been moved to Hand/Battlefield by now.
        return pool
          .filter((c) => c.zone === Zone.Library || c.zone === Zone.Exile)
          .map((c) => c.id);
      }
      default:
        return [];
    }
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
