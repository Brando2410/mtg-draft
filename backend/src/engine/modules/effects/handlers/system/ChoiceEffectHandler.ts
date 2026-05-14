import {
  ActionType,
  EffectDefinition,
  GameObject,
  GameState,
  ModalEffect,
  PlayerId,
  Restriction,
  TargetMapping,
  EngineFrame
} from "@shared/engine_types";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { getProcessors } from "../../../ProcessorRegistry";
import { ChoiceGenerator } from "../../ChoiceGenerator";
import { LogCategory } from "../../../../utils/EngineLogger";

/**
 * Strategy for CR 608: Resolution Choices and CR 701: Keyword Actions (Choice-based)
 */
export class ChoiceEffectHandler {
  public static handleChoice(
    state: GameState,
    effect: ModalEffect,
    context: EngineFrame,
  ): void {
    const { logger } = getProcessors(state);
    const { sourceId, controllerId, stackObject, parentContext } =
      context;

    if (sourceId?.includes('miracle_trigger') || (stackObject && 'id' in stackObject && String(stackObject.id).includes('miracle_trigger'))) {
        logger.info(state, LogCategory.ACTION, `[MIRACLE-RESOLVE] Miracle Choice effect resolving for ${sourceId}.`);
    }

    const targets = context.targets || [];
    const originalTargets = stackObject?.targets || targets;
    const { effect: EP } = getProcessors(state);
    const sourceObj =
      EP.findObject(state, sourceId, stackObject) ||
      stackObject?.sourceObject ||
      stackObject;
    if (!sourceObj) return;

    let dynamicChoices = effect.choices;
    if (dynamicChoices) {
      // Determine who is making the choice (Target player or Spell controller)
      const playerTargets = targets.filter((tid) => state.players[tid as PlayerId]);
      const decisionPlayerId = playerTargets.length > 0 ? (playerTargets[0] as PlayerId) : controllerId;

      const { condition: ConditionProcessor } = getProcessors(state);
      dynamicChoices = dynamicChoices.filter((c) => {
        if (!c.condition) return true;
        return ConditionProcessor.matchesCondition(state, c.condition, {
          sourceId,
          controllerId: decisionPlayerId, // Use the person actually making the decision
          stackObject,
          targets: [],
          effects: []
        });
      });
    }

    // ARCHITECTURAL NOTE: Pre-selected Choices (Silent Auto-Tap)
    // Mana abilities with choices (e.g. dual lands) are pre-calculated by the
    // AutoTapEngine. The chosen index (cIdx) is attached to the stackObject.
    // If present, we consume it here and resolve the effects immediately,
    // bypassing the creation of a 'RESOLUTION_CHOICE' pending action/modal.
    const preSelectedIdx =
      stackObject?.preSelectedChoice !== undefined
        ? stackObject.preSelectedChoice
        : stackObject?.data?.preSelectedChoice;

    if (preSelectedIdx !== undefined && dynamicChoices) {
      const rawIndices = String(preSelectedIdx)
        .split("|")
        .map((s) => {
          return s.startsWith("CHOICE_")
            ? parseInt(s.substring(7))
            : parseInt(s);
        });

      const allEffects: EffectDefinition[] = [];
      rawIndices.forEach((idx) => {
        const choice = dynamicChoices[idx];
        if (choice && choice.effects) {
          allEffects.push(...choice.effects);
        }
      });

      if (allEffects.length > 0) {
        logger.info(state, LogCategory.ACTION, `[RESOLVING CHOICE] Auto-resolved pre-selected modes: ${rawIndices.join(", ")}`);

        // Pay costs for pre-selected choices if any
        const { cost: CP } = getProcessors(state);
        rawIndices.forEach((idx) => {
          const choice = dynamicChoices[idx];
          if (choice && choice.costs) {
            CP.pay(state, choice.costs, sourceId, controllerId);
          }
        });

        EP.resolveEffects({
          state,
          context: EP.createEngineFrame(state, {
            sourceId,
            effects: allEffects,
            targets,
            stackObject,
            parentContext: context
          })
        });

        logger.debug(state, LogCategory.ACTION, `[CHOICE-RESOLVE] Handled pre-selected choice for ${sourceId}. Sub-effects: ${allEffects.length}. Targets: ${targets.length}. Original: ${context.originalTargets?.length || 0}`);
        return;
      }
    }

    // --- HAND-PICKING OR GRAVEYARD-PICKING ---
    const targetZoneMapping = effect.selectionPool as string;
    const mappingPlayerId = controllerId;

    const isStandardMapping = ([
      TargetMapping.Target1Hand,
      TargetMapping.Target1HandRevealPick,
      TargetMapping.Target1Graveyard,
      TargetMapping.Target1Battlefield,
      TargetMapping.AllBattlefield,
      TargetMapping.ControllerHand,
      TargetMapping.ControllerGraveyard,
      TargetMapping.ControllerBattlefield,
      TargetMapping.ControllerSideboard,
      TargetMapping.NameACard,
      TargetMapping.OpponentHandRevealPick,
      TargetMapping.LastMilledIds,
      TargetMapping.LastExiledIds,
      TargetMapping.ParentContextExiledIds,
      TargetMapping.LastDiscardedCards,
      TargetMapping.AnyGraveyard,
      TargetMapping.AnyExile,
    ] as TargetMapping[]).includes(targetZoneMapping as TargetMapping);

    if (isStandardMapping) {
      let workingMappingPlayerId = mappingPlayerId;
      if (targetZoneMapping.startsWith("TARGET_1_")) {
        workingMappingPlayerId =
          targetZoneMapping === TargetMapping.Target1HandRevealPick
            ? controllerId
            : (targets[0] as PlayerId) || controllerId;
      }

      const targetPlayer = state.players[workingMappingPlayerId as PlayerId];
      const isGraveyard = targetZoneMapping.endsWith("_GRAVEYARD");
      const isSideboard = targetZoneMapping.endsWith("_SIDEBOARD");
      const isBattlefield =
        targetZoneMapping.endsWith("_BATTLEFIELD") ||
        targetZoneMapping === TargetMapping.AllBattlefield;
      const isNameACard = targetZoneMapping === TargetMapping.NameACard;
      const isLastMilled = targetZoneMapping === TargetMapping.LastMilledIds;
      const isLastExiled =
        targetZoneMapping === TargetMapping.LastExiledIds ||
        targetZoneMapping === TargetMapping.ParentContextExiledIds;
      const isLastDiscarded = targetZoneMapping === TargetMapping.LastDiscardedCards;

      let sourceCards: GameObject[] = [];
      const { targeting: TP } = getProcessors(state);

      if (isNameACard) {
        sourceCards = state.players[controllerId].library;
      } else if (targetZoneMapping === TargetMapping.AnyGraveyard) {
        sourceCards = Object.values(state.players).flatMap(p => p.graveyard);
      } else if (targetZoneMapping === TargetMapping.AnyExile) {
        sourceCards = state.exile;
      } else if (isBattlefield) {
        sourceCards =
          targetZoneMapping === TargetMapping.AllBattlefield
            ? state.battlefield
            : state.battlefield.filter(
              (o: GameObject) => o.controllerId === workingMappingPlayerId,
            );
      } else if (isLastMilled || isLastExiled || isLastDiscarded) {
        const poolIds = TP.resolveTargetMapping(
          state,
          targetZoneMapping,
          context,
          effect,
        ) as string[];
        sourceCards = poolIds
          .map((id: string) => RuleUtils.findObject(state, id))
          .filter(Boolean) as GameObject[];
      } else if (
        targetPlayer ||
        targetZoneMapping === TargetMapping.Target1HandRevealPick ||
        targetZoneMapping === TargetMapping.OpponentHandRevealPick
      ) {
        if (
          targetZoneMapping === TargetMapping.Target1HandRevealPick ||
          targetZoneMapping === TargetMapping.OpponentHandRevealPick
        ) {
          const targetOppId =
            targetZoneMapping === TargetMapping.Target1HandRevealPick
              ? (targets[0] as PlayerId)
              : (Object.keys(state.players).find(
                (pid: string) => pid !== controllerId,
              ) as PlayerId);
          const targetOpp = state.players[targetOppId];
          if (targetOpp) {
            sourceCards = targetOpp.hand;
            targetOpp.hand.forEach((c: GameObject) => (c.isRevealed = true));
          }
        } else {
          sourceCards = isGraveyard
            ? targetPlayer.graveyard
            : isSideboard
              ? targetPlayer.sideboard || []
              : targetPlayer.hand;
        }
      }

      if (isNameACard) {
        state.pendingAction = ChoiceGenerator.createCardChoice(
          state,
          sourceCards,
          {
            label: "Name a non-land card",
            playerId: workingMappingPlayerId as PlayerId,
            sourceId: sourceId,
            restrictions: effect.restrictions || [Restriction.NonLand],
            filterSelectable: true,
            optional: false,
            actionType: ActionType.ResolutionChoice,
            onSelected: (c: GameObject) => {
              if (stackObject) {
                stackObject.chosenName = c.definition.name;
                if (!stackObject.data) stackObject.data = {};
                stackObject.data.chosenName = c.definition.name; // Legacy sync
              }
              return effect.effects || [];
            },
            hideUndo: !stackObject?.isManaAbility && !effect.showCancel,
            isSpellCasting: !!effect.isSpellCasting,
            isFreeCast: !!effect.isFreeCast || (effect.effects || []).some((e) => e.isFreeCast),
            exileOnResolution: !!effect.exileOnResolution || (effect.effects || []).some((e) => e.exileOnResolution),
            stackObj: stackObject,
            parentContext: context,
            targets: originalTargets,
          },
        );
        const data = state.pendingAction?.data as { isFreeCast?: boolean, exileOnResolution?: boolean };
        logger.debug(state, LogCategory.ACTION, `[CHOICE-HANDLER-DEBUG] Created choice for ${effect.label}. isFreeCast=${data?.isFreeCast}, exileOnResolution=${data?.exileOnResolution}`);
        return;
      }

      if (targetZoneMapping === TargetMapping.Target1Hand) {
        targetPlayer!.hand.forEach((c: GameObject) => (c.isRevealed = true));
      }

      const targetDefinitions = effect.targetDefinitions;
      const def = Array.isArray(targetDefinitions) ? targetDefinitions[0] : targetDefinitions;
      const restrictions =
        effect.restrictions ||
        (def
          ? [
            ...(def.restrictions || []),
            ...(def.type ? [def.type] : []),
          ]
          : []);

      const validCandidates = sourceCards.filter((c: GameObject) => {
        const matched = TP.matchesRestrictions(
          state,
          c,
          restrictions,
          {
            sourceId,
            controllerId: workingMappingPlayerId as PlayerId,
            stackObject,
            targets: [],
            effects: []
          }
        );
        logger.debug(state, LogCategory.ACTION, `[CHOICE-HANDLER-DEBUG] Card ${c.definition?.name} (${c.id}) matches restrictions ${JSON.stringify(restrictions)}: ${matched}`);
        return matched;
      });

      logger.debug(state, LogCategory.ACTION, `[CHOICE-HANDLER-DEBUG] Total validCandidates: ${validCandidates.length}`);

      if (validCandidates.length === 0) {
        logger.info(state, LogCategory.ACTION, `[INFO] ChoiceEffectHandler: No valid targets in zone for "${effect.label || "Choice"}". Auto-skipping.`);
        return;
      }

      state.pendingAction = ChoiceGenerator.createCardChoice(
        state,
        sourceCards,
        {
          label:
            effect.label ||
            (isGraveyard
              ? "Choose a card from Graveyard"
              : isSideboard
                ? "Choose a Lesson from Sideboard"
                : isBattlefield
                  ? "Choose a permanent to return"
                  : isLastMilled
                    ? "Choose a milled card"
                    : isLastDiscarded
                      ? "Choose a discarded card"
                      : "Choose a card from Hand"),
          playerId: workingMappingPlayerId as PlayerId,
          sourceId: sourceId,
          restrictions: restrictions,
          filterSelectable: true,
          minChoices: EP.resolveAmount(state, (effect.minChoices || def?.minCount || (def?.optional ? 0 : def?.count || 1)), context, sourceCards.map(c => c.id)),
          maxChoices: EP.resolveAmount(state, (effect.maxChoices || def?.count || 1), context, sourceCards.map(c => c.id)),
          optional: effect.optional !== false,
          actionType: effect.optional
            ? ActionType.OptionalAction
            : ActionType.ResolutionChoice,
          onSelected: (c: GameObject) =>
            (effect.effects || []).map((sub) => ({
              ...sub,
              targetIds: [c.id],
            })),
          hideUndo: !stackObject?.isManaAbility && !effect.showCancel,
          isSpellCasting: !!effect.isSpellCasting,
          isFreeCast: !!effect.isFreeCast || (effect.effects || []).some((e) => e.isFreeCast),
          exileOnResolution: !!effect.exileOnResolution || (effect.effects || []).some((e) => e.exileOnResolution),
          stackObj: stackObject,
          parentContext: context,
          targets: originalTargets,
        },
      );
      return;
    }

    // --- GENERIC MODAL CHOICES OR AUTO-SEQUENCE ---
    if (!effect.choices && effect.effects && targets.length > 0) {
      const firstTargetId = targets[0];
      const nextTargets = targets.slice(1);
      logger.info(state, LogCategory.ACTION, `[AUTO-SEQUENCE] Sequential resolution for target: ${firstTargetId}`);
      EP.resolveEffects({
        state,
        context: EP.createEngineFrame(state, {
          sourceId,
          effects: effect.effects,
          targets: [firstTargetId],
          stackObject,
          parentContext: context
        })
      });

      logger.debug(state, LogCategory.ACTION, `[AUTO-SEQUENCE] Sequential resolution for ${sourceId}. Remaining targets: ${nextTargets.length}. Original: ${context.originalTargets?.length || 0}`);

      if (!state.pendingAction && nextTargets.length > 0) {
        return this.handleChoice(state, effect, {
          ...context,
          targets: nextTargets,
        });
      } else if (state.pendingAction && nextTargets.length > 0) {
        if (!state.pendingAction.data) {
          state.pendingAction.data = { label: "Resolution" };
        }
        const data = state.pendingAction.data!;
        data.nextPlayerIds = nextTargets;
        data.isChoiceSequence = true;
        data.sequencedEffect = effect;
      }
      return;
    }

    // --- GENERIC MODAL CHOICES ---
    const playerTargets = targets.filter(
      (tid: string) => state.players[tid as PlayerId],
    );
    const firstPlayerId =
      playerTargets.length > 0 ? (playerTargets[0] as PlayerId) : controllerId;
    const nextPlayers =
      playerTargets.length > 1 ? (playerTargets.slice(1) as PlayerId[]) : [];

    const cardTargets = targets.filter(
      (tid: string) => !state.players[tid as PlayerId],
    );
    const lookingCards = cardTargets
      .map((tid: string) => RuleUtils.findObject(state, tid))
      .filter(Boolean) as GameObject[];

    state.pendingAction = ChoiceGenerator.createModalChoice(
      state,
      {
        label: effect.label || "Choose an option",
        playerId: firstPlayerId,
        sourceId: sourceId,
        actionType: effect.optional
          ? ActionType.OptionalAction
          : ActionType.ResolutionChoice,
        optional: !!effect.optional,
        showCancel: !!effect.showCancel,
        hideUndo: !stackObject?.isManaAbility && !effect.showCancel,
        lookingCards,
        minChoices: EP.resolveAmount(state, (effect.minChoices || 1), context, targets),
        maxChoices: EP.resolveAmount(state, (effect.maxChoices || 1), context, targets),
        exileOnResolution: !!effect.exileOnResolution || (effect.effects || []).some((e) => e.exileOnResolution),
        allowDuplicates: effect.allowDuplicates,
        stackObj: stackObject,
        parentContext: context,
        targets: originalTargets,
      },
      (dynamicChoices || []).map((c, idx) => ({
        ...c,
        value: c.value !== undefined ? c.value : idx,
      })),
    );

    if (
      state.pendingAction &&
      state.pendingAction.data &&
      nextPlayers.length > 0
    ) {
      state.pendingAction.data.nextPlayerIds = nextPlayers;
    }
  }
}
