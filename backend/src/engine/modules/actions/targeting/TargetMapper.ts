import {
  GameObject, GameState,
  PlayerId, ResolutionContext,
  TargetingContext, TargetMapping, Zone
} from "@shared/engine_types";
import { ManaProcessor } from "../../magic/ManaProcessor";
import { TargetValidator } from "./TargetValidator";

export class TargetMapper {
  public static calculateTotalCounts(
    targetDef: any,
    xValue: number = 0,
  ): { maxCount: number; minCount: number; count: number } {
    let maxCount = 0;
    let minCount = 0;
    let targetCount = 0;
    const defs = Array.isArray(targetDef) ? targetDef : [targetDef];

    defs.forEach((d) => {
      if (!d) return;
      let count = d.count;
      let dMin = d.minCount;
      let dMax = d.maxCount;

      // Handle structured count object: { min, max } or 'any'
      if (typeof count === "object" && count !== null) {
        dMin = count.min;
        dMax = count.max;
        count = dMax; // Base count is the specific upper bound
      } else if (count === "any") {
        dMin = 0;
        dMax = 999;
        count = 999;
      }

      if (count === "X") count = xValue;
      count = count || 1;

      if (dMax === undefined || dMax === null) dMax = count;
      if (dMax === "X") dMax = xValue;

      if (dMin === undefined || dMin === null)
        dMin = d.optional ? 0 : count;
      if (dMin === "X") dMin = xValue;

      maxCount += Number(dMax);
      minCount += Number(dMin);
      targetCount += Number(count);
    });

    return {
      maxCount: Number(maxCount),
      minCount: Number(minCount),
      count: Number(targetCount),
    };
  }

  public static generateTargetPrompt(
    targetDef: any,
    selectedCount: number,
    xValue: number = 0,
    isSpellCasting: boolean = false,
  ): string {
    const def = this.getDefinitionForIndex(targetDef, selectedCount);
    if (!def) return "Select targets";

    const currentCounts = this.calculateTotalCounts(def, xValue);
    const globalCounts = this.calculateTotalCounts(targetDef, xValue);

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
    } else if (type === "anytarget" || type === "any_target") {
      typeStr = "any target";
    } else {
      // Complex object labeling based on type & restrictions
      let adjectives: string[] = [];
      let mainNoun = "target";
      let location = "";

      // Mapping for base types (handles both shorthand strings and internal enum names)
      const baseTypeMap: Record<string, string> = {
        creature: "creature",
        artifact: "artifact",
        land: "land",
        enchantment: "enchantment",
        planeswalker: "planeswalker",
        permanent: "permanent",
        spell: "spell",
        card: "card",
        cardingraveyard: "card",
        card_in_graveyard: "card",
        cardinhand: "card",
        card_in_hand: "card",
        cardinexile: "card",
        card_in_exile: "card",
        spellonstack: "spell",
        spell_on_stack: "spell",
        non_land_permanent: "nonland permanent",
        nonland_permanent: "nonland permanent",
        nonlandpermanent: "nonland permanent",
        instant_or_sorcery: "instant or sorcery card",
        instantorsorcery: "instant or sorcery card",
        player_or_planeswalker: "player or planeswalker",
        artifact_or_creature: "artifact or creature",
        artifactorcreature: "artifact or creature",
        artifact_or_enchantment: "artifact or enchantment",
        artifactorenchantment: "artifact or enchantment",
        creature_or_planeswalker: "creature or planeswalker",
        creatureorplaneswalker: "creature or planeswalker",
      };

      mainNoun = baseTypeMap[type] || type;

      if (type.includes("graveyard")) location = "in any graveyard";
      if (type.includes("hand")) location = "in hand";
      if (type.includes("exile")) location = "in exile";

      const knownAdjectives = [
        "other",
        "another",
        "nonland",
        "noncreature",
        "token",
        "nontoken",
        "legendary",
        "tapped",
        "untapped",
        "monocolored",
        "multicolored",
        "colorless",
        "white",
        "blue",
        "black",
        "red",
        "green",
      ];

      const baseTypes = [
        "creature",
        "artifact",
        "land",
        "enchantment",
        "planeswalker",
        "permanent",
        "spell",
        "card",
      ];

      for (const r of restrictions) {
        if (typeof r !== "string") continue;
        const lr = r.toLowerCase();

        // 1. Basic Adjectives
        if (knownAdjectives.includes(lr)) {
          if (lr === "other" || lr === "another")
            adjectives.unshift("another"); // "Another" always comes first
          else adjectives.push(lr);
          continue;
        }

        // 2. Type overrides or subtype as adjective
        if (baseTypes.includes(lr)) {
          if (
            mainNoun === "card" ||
            mainNoun === "target" ||
            mainNoun === "permanent"
          ) {
            mainNoun = lr + (mainNoun === "card" ? " card" : "");
          }
        } else if (lr === "instant" || lr === "sorcery") {
          mainNoun = lr + " card";
        } else if (lr === "instantorsorcery" || lr === "instant_or_sorcery") {
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
        if (lr === "youcontrol" || lr === "yours" || lr === "youown") {
          if (location.includes("graveyard")) location = "in your graveyard";
          else if (location.includes("hand")) location = "in your hand";
          else if (location.includes("exile")) location = "in your exile";
          else location = "you control";
        } else if (
          lr === "opponentcontrol" ||
          lr === "opponents" ||
          lr === "opponentcontrols" ||
          lr === "opponentowns"
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
    if (def.minCount === 0 && def.count > 0) {
      const countStr = def.count === 1 ? "one" : def.count;
      let cleanType = typeStr;
      if (cleanType.startsWith("a ")) cleanType = cleanType.substring(2);
      if (cleanType.startsWith("an ")) cleanType = cleanType.substring(3);
      const finalType =
        def.count > 1 || def.count === "X"
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
    const stackData = stackObject;
    const targetingContext: TargetingContext = {
      sourceId,
      controllerId,
      stackObject,
    };

    const eventData =
      (stackData as any)?.eventData ||
      (stackData as any)?.data?.eventData ||
      (stackData as any)?.event ||
      (stackData as any)?.trigger?.event;

    switch (mapping) {
      case TargetMapping.Self:
      case "SOURCE_OBJECT":
        return [sourceId];
      case TargetMapping.Controller:
        return [controllerId];
      case "CONTROLLER_HAND":
        return state.players[controllerId]?.hand.map((o) => o.id) || [];
      case "CONTROLLER_GRAVEYARD":
        return state.players[controllerId]?.graveyard.map((o) => o.id) || [];
      case "CONTROLLER_SIDEBOARD":
        return (state.players[controllerId] as any)?.sideboard?.map((o: any) => o.id) || [];
      case "CONTROLLER_LIBRARY":
        return state.players[controllerId]?.library.map((o) => o.id) || [];
      case "OPPONENT_HAND": {
        const opponentId = Object.keys(state.players).find((pid) => pid !== controllerId);
        return opponentId ? state.players[opponentId].hand.map((o) => o.id) : [];
      }
      case "OPPONENT_GRAVEYARD": {
        const opponentId = Object.keys(state.players).find((pid) => pid !== controllerId);
        return opponentId ? state.players[opponentId].graveyard.map((o) => o.id) : [];
      }
      case "LINKED_OBJECT":
        const linkKey = effect.linkKey || "linkedCardId";
        const lSource =
          state.battlefield.find((o: any) => o.id === sourceId) ||
          (Object.values(state.players) as any[])
            .flatMap((p) => p.graveyard)
            .find((o: any) => o.id === sourceId) ||
          state.exile.find((o: any) => o.id === sourceId);
        return lSource?.data?.[linkKey] ? [lSource.data[linkKey]] : [];
      case TargetMapping.EnchantedCreature:
      case "ENCHANTED_PERMANENT": {
        const aura = state.battlefield.find((o) => o.id === sourceId);
        return aura?.attachedTo ? [aura.attachedTo] : [];
      }
      case TargetMapping.LastCreatedToken:
        return (state as any).lastCreatedTokenId
          ? [(state as any).lastCreatedTokenId]
          : [];
      case TargetMapping.LastExiledIds:
        return (state as any).lastExiledIds || [];
      case "PARENT_CONTEXT_EXILED_IDS": {
        const result = (context.exiledIds && context.exiledIds.length > 0) ? context.exiledIds : (parentContext?.exiledIds || []);
        return result;
      }
      case "PARENT_CONTEXT_EXILED_IDS_OWNERS": {
        const ids = (context.exiledIds && context.exiledIds.length > 0) ? context.exiledIds : (parentContext?.exiledIds || []);
        const owners = ids
          .map(
            (id: string) =>
              TargetValidator.findObjectInAnyZone(state, id)?.ownerId,
          )
          .filter(Boolean) as string[];
        return [...new Set(owners)];
      }
      case "TARGET_1_OWNER": {
        const targetId = targets[0];
        const obj = TargetValidator.findObjectInAnyZone(state, targetId);
        return obj ? [obj.ownerId] : [];
      }
      case "LAST_MILLED_IDS":
        return (state as any).lastMilledIds || [];
      case "TARGET_1":
        return targets[0] ? [targets[0]] : [];
      case "SELF_AND_TARGET_1":
        return targets[0] ? [sourceId, targets[0]] : [sourceId];
      case "TARGET_2":
        return targets[1] ? [targets[1]] : [];
      case "TARGET_3":
        return targets[2] ? [targets[2]] : [];
      case "TARGET_4":
        return targets[3] ? [targets[3]] : [];
      case "TARGET_5":
        return targets[4] ? [targets[4]] : [];
      case "TARGET_6":
        return targets[5] ? [targets[5]] : [];
      case "TARGET_7":
        return targets[6] ? [targets[6]] : [];
      case "TARGET_8":
        return targets[7] ? [targets[7]] : [];
      case "TARGET_ALL":
        return (targets || []).filter(Boolean);
      case "TRIGGER_EVENT_SOURCE":
        return [context.event?.sourceId || context.event?.data?.sourceId || context.event?.payload?.sourceId || ""];
      case "EVENT_SOURCE":
        return [context.event?.sourceId || context.event?.data?.sourceId || context.event?.payload?.sourceId || ""];
      case "MATCHING_PERMANENTS_YOU_CONTROL":
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
      case "ALL_PLANESWALKERS_YOU_CONTROL":
        return state.battlefield
          .filter(
            (o) =>
              o.controllerId === controllerId &&
              o.definition.types.some(
                (t) => t.toLowerCase() === "planeswalker",
              ),
          )
          .map((o) => o.id);
      case "ALL_CREATURES":
        return state.battlefield
          .filter((o) =>
            o.definition.types.some((t) => t.toLowerCase() === "creature"),
          )
          .map((o) => o.id);
      case "ALL_PLANESWALKERS":
        return state.battlefield
          .filter((o) =>
            o.definition.types.some((t) => t.toLowerCase() === "planeswalker"),
          )
          .map((o) => o.id);
      case "MATCHING_PERMANENTS":
      case "ALL_MATCHING_PERMANENTS":
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

      case "TRIGGER_EVENT_SOURCE":
      case "EVENT_SOURCE":
      case "TRIGGER_SOURCE": {
        const eData =
          eventData ||
          parentContext?.eventData ||
          (stackData as any)?.eventData;
        const pSourceId = eData?.payload?.sourceId || eData?.sourceId;
        return pSourceId
          ? [pSourceId]
          : stackData?.sourceId
            ? [stackData.sourceId]
            : [];
      }
      case "TRIGGER_TARGET": {
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
      case "EVENT_TARGET": {
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
      case "EVENT_PLAYER": {
        const eData =
          eventData ||
          parentContext?.eventData ||
          (stackData as any)?.eventData;
        return eData?.payload?.playerId || eData?.playerId
          ? [eData?.payload?.playerId || eData?.playerId]
          : [];
      }
      case "EVENT_OBJECT_CONTROLLER": {
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
        return obj?.controllerId ? [obj.controllerId] : [];
      }
      case "TARGET_1_CONTROLLER": {
        const targetId = targets[0];
        // Check if we have persisted controller information first
        if (
          (stackData as any)?.targetsControllers &&
          (stackData as any).targetsControllers[0]
        ) {
          return [(stackData as any).targetsControllers[0]];
        }
        if (state.players[targetId as PlayerId]) return [targetId];
        const obj =
          state.battlefield.find((o) => o.id === targetId) ||
          state.stack.find(
            (s) =>
              s.id === targetId ||
              s.card?.id === targetId ||
              (s as any).targetId === targetId,
          ) ||
          Object.values(state.players)
            .flatMap((p) => p.graveyard)
            .find((o) => o.id === targetId) ||
          state.exile.find((o) => o.id === targetId);
        return obj ? [obj.controllerId] : [];
      }
      case "TRIGGER_TARGET_CONTROLLER": {
        const tId = eventData?.targetId || stackData?.data?.eventData?.targetId;
        const obj =
          state.battlefield.find((o) => o.id === tId) ||
          (Object.values(state.players) as any[])
            .flatMap((p) => p.graveyard)
            .find((o: any) => o.id === tId);
        return obj ? [obj.controllerId] : [];
      }
      case "ALL_CREATURES_YOU_CONTROL":
        return state.battlefield
          .filter(
            (o) =>
              o.controllerId === controllerId &&
              o.definition.types.some((t) => t.toLowerCase() === "creature"),
          )
          .map((o) => o.id);
      case "OTHER_CREATURES_YOU_CONTROL":
        return state.battlefield
          .filter(
            (o) =>
              o.id !== sourceId &&
              o.controllerId === controllerId &&
              o.definition.types.some((t) => t.toLowerCase() === "creature"),
          )
          .map((o) => o.id);
      case "OTHER_SPIRITS_YOU_CONTROL":
        return state.battlefield
          .filter(
            (o) =>
              o.id !== sourceId &&
              o.controllerId === controllerId &&
              o.definition.subtypes?.some((t) => t.toLowerCase() === "spirit"),
          )
          .map((o) => o.id);
      case "ALL_PERMANENTS_YOU_CONTROL":
        return state.battlefield
          .filter((o) => o.controllerId === controllerId)
          .map((o) => o.id);
      case "ALL_FRACTALS_YOU_CONTROL":
        return state.battlefield
          .filter(
            (o) =>
              o.controllerId === controllerId &&
              o.definition.subtypes?.some((s) => s.toLowerCase() === "fractal"),
          )
          .map((o) => o.id);
      case "OTHER_CREATURES":
      case "ALL_OTHER_CREATURES":
        return state.battlefield
          .filter(
            (o) =>
              o.id !== sourceId &&
              o.definition.types.some((t) => t.toLowerCase() === "creature"),
          )
          .map((o) => o.id);
      case "EACH_CREATURE_YOU_CONTROL":
        return state.battlefield
          .filter(
            (o) =>
              o.controllerId === controllerId &&
              o.definition.types.some((t) => t.toLowerCase() === "creature"),
          )
          .map((o) => o.id);
      case "OPPONENT":
      case "OPPONENTS":
      case "EACH_OPPONENT":
        return Object.keys(state.players).filter((pid) => pid !== controllerId);
      case "OPPONENT_1":
      case "TARGET_OPPONENT":
        return [
          Object.keys(state.players).filter((pid) => pid !== controllerId)[0],
        ];
      case "EACH_OPPONENT_CREATURE":
        return state.battlefield
          .filter(
            (o) =>
              o.controllerId !== controllerId &&
              o.definition.types.some((t) => t.toLowerCase() === "creature"),
          )
          .map((o) => o.id);
      case "EACH_PLAYER":
        return Object.keys(state.players);
      case "ALL_CREATURES_CONTROLLED_BY_TARGET_1": {
        const targetPlayerId = targets[0] as PlayerId;
        if (!targetPlayerId) return [];
        return state.battlefield
          .filter(
            (o) =>
              o.controllerId === targetPlayerId &&
              o.definition.types.some((t) => t.toLowerCase() === "creature"),
          )
          .map((o) => o.id);
      }
      case "SELECTED_CARD":
        return [targets[0]];
      case "LAST_CREATED_TOKEN":
        return (state as any).lastCreatedTokenId
          ? [(state as any).lastCreatedTokenId]
          : [];
      case "CONTROLLER_GRAVEYARD":
        const cp = state.players[controllerId];
        return cp ? cp.graveyard.map((c) => c.id) : [];
      case "CONTROLLER_GRAVEYARD_AND_LIBRARY":
        const pc = state.players[controllerId];
        return pc
          ? [...pc.graveyard.map((c) => c.id), ...pc.library.map((c) => c.id)]
          : [];
      case "LAST_EXILED_OBJECT":
        return (state as any).lastExiledIds || [];
      case "LAST_DISCARDED_CARDS":
        return state.turnState.lastDiscardedIds || [];
      case "ALL_PLAYERS":
        return Object.keys(state.players);
      case "ANY_TARGET":
        return targets;
      case "OTHER_CREATURES_AND_PLANESWALKERS":
        const chosenId = targets[0];
        return state.battlefield
          .filter(
            (o) =>
              o.id !== chosenId &&
              (o.definition.types.some((t) => t.toLowerCase() === "creature") ||
                o.definition.types.some(
                  (t) => t.toLowerCase() === "planeswalker",
                )),
          )
          .map((o) => o.id);
      case "ALL_CREATURES_AND_PLANESWALKERS":
        return state.battlefield
          .filter(
            (o) =>
              o.definition.types.some((t) => t.toLowerCase() === "creature") ||
              o.definition.types.some(
                (t) => t.toLowerCase() === "planeswalker",
              ),
          )
          .map((o) => o.id);
      case "ALL_CREATURES":
        return state.battlefield
          .filter((o) =>
            o.definition.types.some((t) => t.toLowerCase() === "creature"),
          )
          .map((o) => o.id);
      case "ALL_PLANESWALKERS":
        return state.battlefield
          .filter((o) =>
            o.definition.types.some((t) => t.toLowerCase() === "planeswalker"),
          )
          .map((o) => o.id);
      case "ALL_PLANESWALKERS_YOU_CONTROL":
        return state.battlefield
          .filter(
            (o) =>
              o.controllerId === controllerId &&
              o.definition.types.some(
                (t) => t.toLowerCase() === "planeswalker",
              ),
          )
          .map((o) => o.id);
      case "OTHER_PLANESWALKERS_YOU_CONTROL":
        return state.battlefield
          .filter(
            (o) =>
              o.id !== sourceId &&
              o.controllerId === controllerId &&
              o.definition.types.some(
                (t) => t.toLowerCase() === "planeswalker",
              ),
          )
          .map((o) => o.id);
      case "TARGET_1_HIGHEST_MV_CREATURE_PLANESWALKER": {
        const targetPlayerId = targets[0];
        const candidates = state.battlefield.filter(
          (o) =>
            o.controllerId === targetPlayerId &&
            (o.definition.types.some((t) => t.toLowerCase() === "creature") ||
              o.definition.types.some(
                (t) => t.toLowerCase() === "planeswalker",
              )),
        );
        if (candidates.length === 0) return [];
        const mvs = candidates.map((o) =>
          ManaProcessor.getManaValue(o.definition.manaCost || ""),
        );
        const maxMV = Math.max(...mvs);
        return candidates
          .filter(
            (o) =>
              ManaProcessor.getManaValue(o.definition.manaCost || "") === maxMV,
          )
          .map((o) => o.id);
      }
      case "EVENT_PLAYER":
      case "TRIGGER_CONTROLLER":
        return eventData?.playerId ? [eventData.playerId] : [];
      case "EVENT_SOURCE":
      case "TRIGGER_SOURCE":
      case "TRIGGER_EVENT_SOURCE":
      case "WARD_SPELL":
        return eventData?.sourceId
          ? [eventData.sourceId]
          : eventData?.data?.sourceId
            ? [eventData.data.sourceId]
            : eventData?.data?.sourceCard?.id
              ? [eventData.data.sourceCard.id]
              : [];
      case "EVENT_TARGET":
      case "TRIGGER_TARGET":
        return eventData?.targetId
          ? [eventData.targetId]
          : eventData?.data?.targetId
            ? [eventData.data.targetId]
            : eventData?.data?.object?.id
              ? [eventData.data.object.id]
              : [];
      case "EVENT_OBJECT":
        return eventData?.object?.id ? [eventData.object.id] : [];
      case "EXILED_CARD": {
        // Return the ID of the object that was just exiled by this effect chain
        return parentContext?.exiledIds || [];
      }
      case "MATCHING_CARDS": {
        if (!effect?.restrictions) return [];
        const pool = [
          ...state.battlefield.map((o: any) => o.id),
          ...state.exile.map((o: any) => o.id),
          ...(Object.values(state.players) as any[])
            .flatMap((p) => [...p.hand, ...p.graveyard, ...p.library])
            .map((c: any) => c.id),
        ];
        return pool.filter((tid) => {
          const obj = TargetValidator.findObjectInAnyZone(state, tid);
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
      case "REMAINDER_OF_POOL":
      case "REMAINDER_OF_LOOKING_CARDS": {
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
    targetDef: any,
    targetIndex: number,
  ): any {
    if (!targetDef) return null;
    const def = (() => {
        if (!Array.isArray(targetDef)) return targetDef;
        let cumulative = 0;
        for (const d of targetDef) {
            const count = typeof d.count === "number" ? d.count : 1;
            if (targetIndex >= cumulative && targetIndex < cumulative + count) {
                return d;
            }
            cumulative += count;
        }
        return targetDef[targetDef.length - 1];
    })();
    // console.log(`[MAPPER-DEBUG] targetIndex ${targetIndex} resolved to:`, JSON.stringify(def));
    return def;
  }
}
