import {
    ActionType,
    GameObject,
    GameState,
    PlayerId,
    ResolutionContext,
    Zone,
    ModalEffect,
    EffectDefinition,
    StackObject
} from "@shared/engine_types";
import { ActionProcessor } from "../../../actions/ActionProcessor";
import { ChoiceGenerator } from "../../ChoiceGenerator";
import { TriggerProcessor } from "../../triggers/TriggerProcessor";

/**
 * Strategy for CR 608: Resolution Choices and CR 701: Keyword Actions (Choice-based)
 */
export class ChoiceEffectHandler {
  public static handleChoice(
    state: GameState,
    effect: ModalEffect,
    log: (m: string) => void,
    context: ResolutionContext,
  ): void {
    const { sourceId, controllerId, targets, stackObject, parentContext } =
      context;
    const { EffectProcessor } = require("../../EffectProcessor");
    const sourceObj =
      EffectProcessor.findObject(state, sourceId, stackObject) ||
      stackObject?.card ||
      stackObject;
    if (!sourceObj) return;

    let dynamicChoices = effect.choices;
    if (dynamicChoices) {
      const { ConditionProcessor } = require("../../../core/ConditionProcessor");
      dynamicChoices = dynamicChoices.filter((c) => {
        if (!c.condition) return true;
        return ConditionProcessor.matchesCondition(state, c.condition as any, {
          sourceId,
          controllerId,
          stackObject,
        });
      });
    }

    // ARCHITECTURAL NOTE: Pre-selected Choices (Silent Auto-Tap)
    // Mana abilities with choices (e.g. dual lands) are pre-calculated by the
    // AutoTapEngine. The chosen index (cIdx) is attached to the stackObject.
    // If present, we consume it here and resolve the effects immediately,
    // bypassing the creation of a 'RESOLUTION_CHOICE' pending action/modal.
    const preSelectedIdx =
      stackObject?.data?.preSelectedChoice !== undefined
        ? stackObject.data.preSelectedChoice
        : (stackObject as any)?.preSelectedChoice;

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
        log(
          `[RESOLVING CHOICE] Auto-resolved pre-selected modes: ${rawIndices.join(", ")}`,
        );
        const { EffectProcessor: EP } = require("../../EffectProcessor");
        EP.resolveEffects({
          state,
          effects: allEffects,
          sourceId,
          targets,
          log,
          stackObject,
          parentContext,
        });
        return;
      }
    }

    // --- HAND-PICKING OR GRAVEYARD-PICKING ---
    const targetZoneMapping = (effect as any).targetIdMapping as string;
    const mappingPlayerId = controllerId;

    const isStandardMapping = [
      "TARGET_1_HAND",
      "TARGET_1_HAND_REVEAL_PICK",
      "TARGET_1_GRAVEYARD",
      "TARGET_1_BATTLEFIELD",
      "ALL_BATTLEFIELD",
      "CONTROLLER_HAND",
      "CONTROLLER_GRAVEYARD",
      "CONTROLLER_BATTLEFIELD",
      "CONTROLLER_SIDEBOARD",
      "NAME_A_CARD",
      "OPPONENT_HAND_REVEAL_PICK",
      "LAST_MILLED_IDS",
      "LAST_EXILED_IDS",
      "PARENT_CONTEXT_EXILED_IDS",
    ].includes(targetZoneMapping);

    if (isStandardMapping) {
      let workingMappingPlayerId = mappingPlayerId;
      if (targetZoneMapping.startsWith("TARGET_1_")) {
        workingMappingPlayerId =
          targetZoneMapping === "TARGET_1_HAND_REVEAL_PICK"
            ? controllerId
            : (targets[0] as PlayerId) || controllerId;
      }

      const targetPlayer = state.players[workingMappingPlayerId as PlayerId];
      const isGraveyard = targetZoneMapping.endsWith("_GRAVEYARD");
      const isSideboard = targetZoneMapping.endsWith("_SIDEBOARD");
      const isBattlefield =
        targetZoneMapping.endsWith("_BATTLEFIELD") ||
        targetZoneMapping === "ALL_BATTLEFIELD";
      const isNameACard = targetZoneMapping === "NAME_A_CARD";
      const isLastMilled = targetZoneMapping === "LAST_MILLED_IDS";
      const isLastExiled =
        targetZoneMapping === "LAST_EXILED_IDS" ||
        targetZoneMapping === "PARENT_CONTEXT_EXILED_IDS";

      let sourceCards: GameObject[] = [];
      const { TargetingProcessor } = require("../../../actions/targeting/TargetingProcessor");

      if (isNameACard) {
        sourceCards = state.players[controllerId].library;
      } else if (isBattlefield) {
        sourceCards =
          targetZoneMapping === "ALL_BATTLEFIELD"
            ? state.battlefield
            : state.battlefield.filter(
                (o: GameObject) => o.controllerId === workingMappingPlayerId,
              );
      } else if (isLastMilled || isLastExiled) {
        const poolIds = TargetingProcessor.resolveTargetMapping(
          state,
          targetZoneMapping,
          context,
          effect,
        ) as string[];
        sourceCards = poolIds
          .map((id: string) =>
            TargetingProcessor.findObjectInAnyZone(state, id),
          )
          .filter(Boolean) as GameObject[];
      } else if (
        targetPlayer ||
        targetZoneMapping === "TARGET_1_HAND_REVEAL_PICK" ||
        targetZoneMapping === "OPPONENT_HAND_REVEAL_PICK"
      ) {
        if (
          targetZoneMapping === "TARGET_1_HAND_REVEAL_PICK" ||
          targetZoneMapping === "OPPONENT_HAND_REVEAL_PICK"
        ) {
          const targetOppId =
            targetZoneMapping === "TARGET_1_HAND_REVEAL_PICK"
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
            restrictions: (effect as any).restrictions || ["Nonland"],
            filterSelectable: true,
            optional: false,
            actionType: ActionType.ResolutionChoice,
            onSelected: (c: GameObject) => {
              if (stackObject) {
                if (!stackObject.data) stackObject.data = {};
                stackObject.data.chosenName = c.definition.name;
              }
              return effect.effects || [];
            },
            hideUndo: true,
            stackObj: stackObject,
            parentContext: context,
          },
        );
        return;
      }

      if (targetZoneMapping === "TARGET_1_HAND") {
        targetPlayer!.hand.forEach((c: GameObject) => (c.isRevealed = true));
      }

      const targetDef = (effect as any).targetDefinition;
      const restrictions =
        (effect as any).restrictions ||
        (targetDef
          ? [
              ...(targetDef.restrictions || []),
              ...(targetDef.type ? [targetDef.type] : []),
            ]
          : []);

      const validCandidates = sourceCards.filter((c: GameObject) =>
        TargetingProcessor.matchesRestrictions(
          state,
          c,
          restrictions,
          {
            sourceId,
            controllerId: workingMappingPlayerId as PlayerId,
            stackObject
          }
        ),
      );

      if (validCandidates.length === 0) {
        log(
          `[INFO] ChoiceEffectHandler: No valid targets in zone for "${effect.label || "Choice"}". Auto-skipping.`,
        );
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
                    : "Choose a card from Hand"),
          playerId: workingMappingPlayerId as PlayerId,
          sourceId: sourceId,
          restrictions: restrictions,
          filterSelectable: true,
          minChoices:
            (effect as any).minChoices ||
            targetDef?.minCount ||
            (targetDef?.optional ? 0 : targetDef?.count || 1),
          maxChoices: (effect as any).maxChoices || targetDef?.count || 1,
          optional: (effect as any).optional !== false,
          actionType: (effect as any).optional
            ? ActionType.OptionalAction
            : ActionType.ResolutionChoice,
          onSelected: (c: GameObject) =>
            (effect.effects || []).map((sub: any) => ({
              ...sub,
              targetId: c.id,
            })),
          hideUndo: true,
          stackObj: stackObject,
          parentContext: context,
          targets: targets,
        },
      );
      return;
    }

    // --- GENERIC MODAL CHOICES OR AUTO-SEQUENCE ---
    if (!effect.choices && effect.effects && targets.length > 0) {
      const { EffectProcessor: EP } = require("../../EffectProcessor");
      const firstTargetId = targets[0];
      const nextTargets = targets.slice(1);

      log(`[AUTO-SEQUENCE] Sequential resolution for target: ${firstTargetId}`);
      EP.resolveEffects({
        state,
        effects: effect.effects,
        log,
        sourceId,
        targets: [firstTargetId],
        stackObject,
        parentContext,
      });

      if (!state.pendingAction && nextTargets.length > 0) {
        return this.handleChoice(state, effect, log, {
          ...context,
          targets: nextTargets,
        });
      } else if (state.pendingAction && nextTargets.length > 0) {
        if (!state.pendingAction.data) {
          (state.pendingAction as any).data = { label: "Resolution" };
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
    const {
      TargetingProcessor: TP,
    } = require("../../../actions/targeting/TargetingProcessor");
    const lookingCards = cardTargets
      .map((tid: string) => TP.findObjectInAnyZone(state, tid))
      .filter(Boolean) as GameObject[];

    state.pendingAction = ChoiceGenerator.createModalChoice(
      state,
      {
        label: effect.label || "Choose an option",
        playerId: firstPlayerId,
        sourceId: sourceId,
        actionType: (effect as any).optional
          ? ActionType.OptionalAction
          : ActionType.ResolutionChoice,
        hideUndo: true,
        lookingCards,
        minChoices: (effect as any).minChoices,
        maxChoices: (effect as any).maxChoices,
        stackObj: stackObject,
        parentContext: context,
        targets: targets,
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

  public static handleNecromentia(
    state: GameState,
    effect: EffectDefinition,
    log: (m: string) => void,
    context: ResolutionContext,
  ) {
    const { sourceId, controllerId, targets, stackObject } = context;
    const targetOpponentId = targets[0] as PlayerId;
    const targetOpponent = state.players[targetOpponentId];
    if (!targetOpponent) return;

    if (!stackObject?.data?.chosenName) {
      state.pendingAction = ChoiceGenerator.createCardChoice(
        state,
        state.players[controllerId].library,
        {
          label: "Name a nonbasic card",
          playerId: controllerId,
          sourceId: sourceId,
          restrictions: ["NonbasicLand"],
          optional: false,
          actionType: ActionType.ResolutionChoice,
          onSelected: (c: GameObject) => {
            if (stackObject?.data)
              stackObject.data.chosenName = c.definition.name;
            return [{ type: "Necromentia", targetMapping: "TARGET_1" }];
          },
          stackObj: stackObject,
          parentContext: context,
        },
      );
      return;
    }

    const chosenName = stackObject?.data?.chosenName;
    if (!chosenName) return;
    const zones = [Zone.Graveyard, Zone.Hand, Zone.Library];
    let exiledCount = 0;

    zones.forEach((zone) => {
      let pool =
        zone === Zone.Graveyard
          ? targetOpponent.graveyard
          : zone === Zone.Hand
            ? targetOpponent.hand
            : targetOpponent.library;
      const toExile = pool.filter(
        (c: GameObject) => c.definition.name.toLowerCase() === chosenName.toLowerCase(),
      );
      if (zone === Zone.Hand) exiledCount = toExile.length;

      toExile.forEach((c: GameObject) => {
        const from = c.zone as Zone;
        ActionProcessor.moveCard(state, c, Zone.Exile, c.ownerId, log);
        TriggerProcessor.onEvent(
          state,
          { type: "ON_EXILE", targetId: c.id, sourceId, sourceZone: from },
          log,
        );
      });
    });

    if (exiledCount > 0) {
      const { PermanentHandler } = require("../permanent/PermanentHandler");
      PermanentHandler.handleCreateToken(
        state,
        log,
        { ...context, targets: [targetOpponentId] },
        {
          name: "Zombie",
          power: "2",
          toughness: "2",
          colors: ["B"],
          types: ["Creature"],
          subtypes: ["Zombie"],
          image_url:
            "https://cards.scryfall.io/large/front/d/e/ded254ec-1d94-4458-944c-329a4305ee4c.jpg",
        },
        undefined,
        undefined,
        { amount: exiledCount } as any
      );
    }
  }
}


