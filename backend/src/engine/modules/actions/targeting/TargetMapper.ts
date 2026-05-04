import {
  GameObject, GameState,
  PlayerId, ResolutionContext,
  Restriction,
  TargetingContext, TargetDefinition, TargetMapping, TargetType, Zone
} from "@shared/engine_types";
import { RuleUtils } from "../../../utils/RuleUtils";
import { getProcessors } from "../../ProcessorRegistry";
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
    const restrictions = rawRestrictions.map((r: any) =>
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
    effect?: any,
  ): string[] {
    return this.doResolveTargetMapping(state, mapping, context, effect);
  }

  private static doResolveTargetMapping(
    state: GameState,
    mapping: string,
    context: ResolutionContext,
    effect?: any,
  ): string[] {
    const { sourceId, controllerId, stackObject, targets, parentContext } =
      context;
    const { logger } = getProcessors(state);
    logger.debug(state, LogCategory.TARGETING, `[TARGET-MAP] Mapping ${mapping} for source ${sourceId}. Context targets: ${targets?.join(', ')}`);
    const stackData = stackObject;
    logger.debug(state, LogCategory.TARGETING, `[TARGET-MAP] stackData targets: ${(stackData as any)?.targets?.join(', ')}`);
    const targetingContext: TargetingContext = {
      sourceId,
      controllerId,
      stackObject,
      xValue: context.xValue || stackObject?.xValue || 0,
    };

    const eventData =
      (stackData as any)?.eventData ||
      (stackData as any)?.data?.eventData ||
      (stackData as any)?.event ||
      (stackData as any)?.trigger?.event;

    switch (mapping) {
      case TargetMapping.Self:
      case TargetMapping.SourceObject:
        return [sourceId];
      case TargetMapping.Controller:
        return [controllerId];
      case TargetMapping.ControllerHand:
        return state.players[controllerId]?.hand.map((o) => o.id) || [];
      case TargetMapping.ControllerGraveyard:
        return state.players[controllerId]?.graveyard.map((o) => o.id) || [];
      case TargetMapping.ControllerSideboard:
        return (state.players[controllerId] as any)?.sideboard?.map((o: any) => o.id) || [];
      case TargetMapping.ControllerLibrary:
        return state.players[controllerId]?.library.map((o) => o.id) || [];
      case TargetMapping.OpponentHand: {
        const opponentId = Object.keys(state.players).find((pid) => pid !== controllerId);
        return opponentId ? state.players[opponentId].hand.map((o) => o.id) : [];
      }
      case TargetMapping.OpponentGraveyard: {
        const opponentId = Object.keys(state.players).find((pid) => pid !== controllerId);
        return opponentId ? state.players[opponentId].graveyard.map((o) => o.id) : [];
      }
      case TargetMapping.AnyGraveyard: {
        return Object.values(state.players).flatMap(p => p.graveyard.map(o => o.id));
      }
      case TargetMapping.AnyExile: {
        return state.exile.map(o => o.id);
      }
      case TargetMapping.LinkedObject:
        const linkKey = effect.linkKey || "linkedCardId";
        const lSource =
          state.battlefield.find((o: any) => o.id === sourceId) ||
          (Object.values(state.players) as any[])
            .flatMap((p) => p.graveyard)
            .find((o: any) => o.id === sourceId) ||
          state.exile.find((o: any) => o.id === sourceId);
        return lSource?.data?.[linkKey] ? [lSource.data[linkKey]] : [];
      case TargetMapping.EnchantedCreature:
      case TargetMapping.EnchantedPermanent: {
        const aura = state.battlefield.find((o) => o.id === sourceId);
        return aura?.attachedTo ? [aura.attachedTo] : [];
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
          .filter(Boolean) as string[];
        return [...new Set(owners)];
      }
      case TargetMapping.Target1Owner: {
        const actualTargets = (stackData as any)?.targets?.length ? (stackData as any).targets : targets;
        const targetId = actualTargets[0];
        const obj = RuleUtils.findObject(state, targetId);
        return obj ? [obj.ownerId] : [];
      }
      case TargetMapping.LastMilledIds:
        return state.turnState.lastMilledIds || [];
      case TargetMapping.Target1: {
        const offset = effect?.targetOffset || 0;
        const actualTargets = (stackData as any)?.targets?.length ? (stackData as any).targets : targets;
        logger.debug(state, LogCategory.TARGETING, `[TARGET-MAP] Target1 resolving to ${actualTargets[offset]} (from ${actualTargets.length} candidates)`);
        return actualTargets[offset] ? [actualTargets[offset]] : [];
      }
      case TargetMapping.SelfAndTarget1: {
        const offset = effect?.targetOffset || 0;
        const actualTargets = (stackData as any)?.targets?.length ? (stackData as any).targets : targets;
        return actualTargets[offset] ? [sourceId, actualTargets[offset]] : [sourceId];
      }
      case TargetMapping.Target2: {
        const offset = (effect?.targetOffset || 0) + 1;
        const actualTargets = (stackData as any)?.targets?.length ? (stackData as any).targets : targets;
        return actualTargets[offset] ? [actualTargets[offset]] : [];
      }
      case TargetMapping.Target3: {
        const offset = (effect?.targetOffset || 0) + 2;
        const actualTargets = (stackData as any)?.targets?.length ? (stackData as any).targets : targets;
        return actualTargets[offset] ? [actualTargets[offset]] : [];
      }
      case TargetMapping.Target4: {
        const offset = (effect?.targetOffset || 0) + 3;
        const actualTargets = (stackData as any)?.targets?.length ? (stackData as any).targets : targets;
        return actualTargets[offset] ? [actualTargets[offset]] : [];
      }
      case TargetMapping.Target5: {
        const offset = (effect?.targetOffset || 0) + 4;
        const actualTargets = (stackData as any)?.targets?.length ? (stackData as any).targets : targets;
        return actualTargets[offset] ? [actualTargets[offset]] : [];
      }
      case TargetMapping.Target6: {
        const offset = (effect?.targetOffset || 0) + 5;
        const actualTargets = (stackData as any)?.targets?.length ? (stackData as any).targets : targets;
        return actualTargets[offset] ? [actualTargets[offset]] : [];
      }
      case TargetMapping.Target7: {
        const offset = (effect?.targetOffset || 0) + 6;
        const actualTargets = (stackData as any)?.targets?.length ? (stackData as any).targets : targets;
        return actualTargets[offset] ? [actualTargets[offset]] : [];
      }
      case TargetMapping.Target8: {
        const offset = (effect?.targetOffset || 0) + 7;
        const actualTargets = (stackData as any)?.targets?.length ? (stackData as any).targets : targets;
        return actualTargets[offset] ? [actualTargets[offset]] : [];
      }
      case TargetMapping.TargetAll:
        return ((stackData as any)?.targets || targets || []).filter(Boolean);

      case TargetMapping.MatchingPermanentsYouControl:
      case TargetMapping.AllMatchingPermanentsYouControl:
        if (!effect?.restrictions) return [];
        return state.battlefield
          .filter(
            (o) =>
              o.controllerId === controllerId &&
              TargetValidator.matchesRestrictions(
                state,
                o,
                effect.restrictions,
                targetingContext,
              ),
          )
          .map((o) => o.id);
      case TargetMapping.AllPlaneswalkersYouControl:
        return state.battlefield
          .filter(
            (o) =>
              o.controllerId === controllerId &&
              RuleUtils.isPlaneswalker(o),
          )
          .map((o) => o.id);
      case TargetMapping.AllCreatures:
        return state.battlefield
          .filter((o) => RuleUtils.isCreature(o))
          .map((o) => o.id);
      case TargetMapping.AllPlaneswalkers:
        return state.battlefield
          .filter((o) => RuleUtils.isPlaneswalker(o))
          .map((o) => o.id);
      case TargetMapping.MatchingPermanents:
      case TargetMapping.AllMatchingPermanents:
        if (!effect?.restrictions) return [];
        return state.battlefield
          .filter((o) =>
            TargetValidator.matchesRestrictions(
              state,
              o,
              effect.restrictions,
              targetingContext,
            ),
          )
          .map((o) => o.id);
      case TargetMapping.TriggerEventSource:
      case TargetMapping.EventSource:
      case TargetMapping.TriggerSource: {
        const eData =
          eventData ||
          parentContext?.eventData ||
          parentContext?.event ||
          (stackData as any)?.data?.eventData ||
          (stackData as any)?.data?.event ||
          (stackData as any)?.eventData ||
          (stackData as any)?.event;
        const pSourceId = eData?.payload?.sourceId || eData?.sourceId;
        return pSourceId
          ? [pSourceId]
          : stackData?.sourceId
            ? [stackData.sourceId]
            : [];
      }
      case TargetMapping.TriggerTarget: {
        const eData =
          eventData ||
          parentContext?.eventData ||
          (stackData as any)?.eventData;
        const pTargetId = eData?.payload?.targetId || eData?.targetId;
        return pTargetId
          ? [pTargetId]
          : (stackData as any)?.targetId
            ? [(stackData as any).targetId]
            : [];
      }
      case TargetMapping.EventTarget: {
        const eData =
          eventData ||
          parentContext?.eventData ||
          (stackData as any)?.eventData;
        const pObjId =
          eData?.payload?.object?.id ||
          eData?.payload?.targetId ||
          eData?.object?.id ||
          eData?.targetId;
        return pObjId ? [pObjId] : [];
      }
      case TargetMapping.EventPlayer: {
        const eData =
          eventData ||
          parentContext?.eventData ||
          (stackData as any)?.eventData;
        return eData?.payload?.playerId || eData?.playerId
          ? [eData?.payload?.playerId || eData?.playerId]
          : [];
      }
      case TargetMapping.EventObjectController: {
        const eData =
          eventData ||
          parentContext?.eventData ||
          (stackData as any)?.eventData;
        const obj =
          eData?.payload?.object ||
          eData?.payload?.card ||
          eData?.object ||
          eData?.card ||
          (eData as any)?.gameObject;
        return obj ? [RuleUtils.getController(obj)] : [];
      }
      case TargetMapping.Target1Controller: {
        const actualTargets = (stackData as any)?.targets?.length ? (stackData as any).targets : targets;
        const targetId = actualTargets[0];
        // Check if we have persisted controller information first
        if (
          (stackData as any)?.targetsControllers &&
          (stackData as any).targetsControllers[0]
        ) {
          return [(stackData as any).targetsControllers[0]];
        }
        if (state.players[targetId as PlayerId]) return [targetId];
        const obj = RuleUtils.findObject(state, targetId);
        return obj ? [RuleUtils.getController(obj)] : [];
      }
      case TargetMapping.TriggerTargetController: {
        const tId = eventData?.targetId || stackData?.data?.eventData?.targetId;
        const obj = RuleUtils.findObject(state, tId);
        return obj ? [RuleUtils.getController(obj)] : [];
      }
      case TargetMapping.AllCreaturesYouControl:
        return state.battlefield
          .filter(
            (o) =>
              o.controllerId === controllerId &&
              RuleUtils.isCreature(o),
          )
          .map((o) => o.id);
      case TargetMapping.OtherCreaturesYouControl:
        return state.battlefield
          .filter(
            (o) =>
              o.id !== sourceId &&
              o.controllerId === controllerId &&
              RuleUtils.isCreature(o),
          )
          .map((o) => o.id);
      case TargetMapping.OtherSpiritsYouControl:
        return state.battlefield
          .filter(
            (o) =>
              o.id !== sourceId &&
              o.controllerId === controllerId &&
              RuleUtils.hasSubtype(o, "spirit"),
          )
          .map((o) => o.id);
      case TargetMapping.AllPermanentsYouControl:
        return state.battlefield
          .filter((o) => o.controllerId === controllerId)
          .map((o) => o.id);
      case TargetMapping.AllFractalsYouControl:
        return state.battlefield
          .filter(
            (o) =>
              o.controllerId === controllerId &&
              RuleUtils.hasSubtype(o, "fractal"),
          )
          .map((o) => o.id);
      case TargetMapping.OtherCreatures:
      case TargetMapping.AllOtherCreatures:
        return state.battlefield
          .filter(
            (o) =>
              o.id !== sourceId &&
              RuleUtils.isCreature(o),
          )
          .map((o) => o.id);
      case TargetMapping.EachCreatureYouControl:
        return state.battlefield
          .filter(
            (o) =>
              o.controllerId === controllerId &&
              RuleUtils.isCreature(o),
          )
          .map((o) => o.id);
      case TargetMapping.Opponent:
      case TargetMapping.EachOpponent:
      case TargetMapping.Opponents:
        return Object.keys(state.players).filter((pid) => pid !== controllerId);
      case TargetMapping.Opponent1:
      case TargetMapping.TargetOpponent:
        return [
          Object.keys(state.players).filter((pid) => pid !== controllerId)[0],
        ];
      case TargetMapping.EachOpponentCreature:
        return state.battlefield
          .filter(
            (o) =>
              o.controllerId !== controllerId &&
              RuleUtils.isCreature(o),
          )
          .map((o) => o.id);
      case TargetMapping.EachPlayer:
        return Object.keys(state.players);
      case TargetMapping.AllCreaturesControlledByTarget1: {
        const targetPlayerId = targets[0] as PlayerId;
        if (!targetPlayerId) return [];
        return state.battlefield
          .filter(
            (o) =>
              o.controllerId === targetPlayerId &&
              RuleUtils.isCreature(o),
          )
          .map((o) => o.id);
      }
      case TargetMapping.SelectedCard:
      case TargetMapping.SelectedCards:
        return targets;
      case TargetMapping.ControllerGraveyardAndLibrary:
        const pc = state.players[controllerId];
        return pc
          ? [...pc.graveyard.map((c) => c.id), ...pc.library.map((c) => c.id)]
          : [];
      case TargetMapping.LastExiledObject:
        return state.turnState.lastExiledIds || [];
      case TargetMapping.LastDiscardedCards:
        return state.turnState.lastDiscardedIds || [];
      case TargetMapping.AllPlayers:
        return Object.keys(state.players);
      case TargetMapping.AnyTarget:
        return targets;
      case TargetMapping.OtherCreaturesAndPlaneswalkers:
        const chosenId = targets[0];
        return state.battlefield
          .filter(
            (o) =>
              o.id !== chosenId &&
              (RuleUtils.isCreature(o) || RuleUtils.isPlaneswalker(o)),
          )
          .map((o) => o.id);
      case TargetMapping.AllCreaturesAndPlaneswalkers:
        return state.battlefield
          .filter(
            (o) =>
              RuleUtils.isCreature(o) || RuleUtils.isPlaneswalker(o),
          )
          .map((o) => o.id);
      case TargetMapping.AllPlaneswalkersYouControl:
        return state.battlefield
          .filter(
            (o) =>
              o.controllerId === controllerId &&
              RuleUtils.isPlaneswalker(o),
          )
          .map((o) => o.id);
      case TargetMapping.OtherPlaneswalkersYouControl:
        return state.battlefield
          .filter(
            (o) =>
              o.id !== sourceId &&
              o.controllerId === controllerId &&
              RuleUtils.isPlaneswalker(o),
          )
          .map((o) => o.id);
      case TargetMapping.Target1HighestMVCreaturePlaneswalker: {
        const targetPlayerId = targets[0];
        const candidates = state.battlefield.filter(
          (o) =>
            o.controllerId === targetPlayerId &&
            (RuleUtils.isCreature(o) || RuleUtils.isPlaneswalker(o)),
        );
        if (candidates.length === 0) return [];
        const mvs = candidates.map((o) =>
          ManaProcessor.getEffectiveManaValue(o),
        );
        const maxMV = Math.max(...mvs);
        return candidates
          .filter(
            (o) =>
              ManaProcessor.getEffectiveManaValue(o) === maxMV,
          )
          .map((o) => o.id);
      }
      case TargetMapping.ExiledCard: {
        // Return the ID of the object that was just exiled by this effect chain
        return parentContext?.exiledIds || [];
      }
      case TargetMapping.MatchingCards: {
        if (!effect?.restrictions) return [];
        const sourceZones = effect.sourceZones || [Zone.Battlefield, Zone.Graveyard, Zone.Hand, Zone.Exile, Zone.Library];
        const zones = Array.isArray(sourceZones) ? (sourceZones as any[]) : [sourceZones];

        const pool: string[] = [];
        zones.forEach(z => {
          if (z === Zone.Battlefield) pool.push(...state.battlefield.map(o => o.id));
          else if (z === Zone.Exile) pool.push(...state.exile.map(o => o.id));
          else if (z === Zone.Stack) pool.push(...state.stack.map(s => s.id));
          else {
            // Hand, Graveyard, Library
            Object.values(state.players).forEach(p => {
              if (z === Zone.Hand) pool.push(...p.hand.map(c => c.id));
              else if (z === Zone.Graveyard) pool.push(...p.graveyard.map(c => c.id));
              else if (z === Zone.Library) pool.push(...p.library.map(c => c.id));
            });
          }
        });

        return pool.filter((tid) => {
          const obj = RuleUtils.findObject(state, tid);
          return (
            obj &&
            TargetValidator.matchesRestrictions(
              state,
              obj,
              effect.restrictions,
              targetingContext,
            )
          );
        });
      }
      case TargetMapping.RemainderOfPool:
      case TargetMapping.RemainderOfLookingCards: {
        const pool = (parentContext?.lookingCards ||
          (stackData as any)?.lookingCards ||
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
