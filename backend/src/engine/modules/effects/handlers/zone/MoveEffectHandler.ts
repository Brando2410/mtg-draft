import {
  ActionType,
  DrawEffect,
  EffectDefinition,
  EffectType,
  GameObject,
  GameState,
  MoveEffect,
  PlayerId,
  PlayerState,
  ResolutionContext,
  SelectionType,
  TargetMapping,
  TargetType,
  TriggerEvent,
  Zone
} from "@shared/engine_types";
import { LogCategory } from "../../../../utils/EngineLogger";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { ActionProcessor } from "../../../actions/ActionProcessor";
import { TargetingProcessor } from "../../../actions/targeting/TargetingProcessor";
import { RestrictionValidator } from "../../../core/RestrictionValidator";
import { getProcessors } from "../../../ProcessorRegistry";
import { ChoiceGenerator } from "../../ChoiceGenerator";
import { TriggerProcessor } from "../../triggers/TriggerProcessor";
import { SearchEffectHandler } from "./SearchEffectHandler";
import { DrawCardsHandler } from "./DrawCardsHandler";

/**
 * Strategy for CR 701: Keyword Actions (Zone Movement)
 */
export class MoveEffectHandler {
  public static handle(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
    const { logger } = getProcessors(state);
    const { targets = [], controllerId, stackObject, parentContext } = context || {};
    const moveEff = effect as MoveEffect;
    const drawEff = effect as DrawEffect;

    const targetIds = effect.targetId
      ? [effect.targetId]
      : targets.length > 0
        ? targets
        : [];

    // Fallback to stack targets ONLY if this is a top-level effect resolution and no targets were provided
    const finalTargetIds =
      targetIds.length === 0 && !parentContext
        ? stackObject?.targets || []
        : targetIds;

    const selectionType = effect.selectionType ||
      (effect.targetMapping === TargetMapping.AllMatchingCards ? "All" : "Target");

    // Rule: Resolve default zone for specific movement keywords
    if (!moveEff.zone) {
      if (effect.type === EffectType.Exile || effect.type === EffectType.ExileTopCard || effect.type === EffectType.ExileAllCards) {
        moveEff.zone = Zone.Exile;
      } else if (effect.type === EffectType.DrawCards || effect.type === EffectType.ReturnToHand || effect.type === EffectType.MoveToZone) {
        moveEff.zone = Zone.Hand;
      } else if (effect.type === EffectType.DiscardCards || effect.type === EffectType.Mill || effect.type === EffectType.PutInGraveyard) {
        moveEff.zone = Zone.Graveyard;
      } else if (effect.type === EffectType.PutOnBattlefield) {
        moveEff.zone = Zone.Battlefield;
      }
    }

    logger.info(state, LogCategory.ACTION, 
      `[MOVE-ZONE] Type: ${effect.type}, Selection: ${selectionType}, Zone: ${moveEff.zone}`,
    );

    // Map legacy effect types to selection modes if needed
    if (effect.type === EffectType.DrawCards) return DrawCardsHandler.handle(state, effect, context);
    if (effect.type === EffectType.LookAtTopAndPick) return this.resolveLookAtTopAndPick(state, effect, context, finalTargetIds);
    if (effect.type === EffectType.RevealUntilCondition) return this.resolveRevealUntilCondition(state, effect, context);
    if (effect.type === EffectType.ExchangeHandAndGraveyard) return this.resolveExchangeHandAndGraveyard(state, effect, targets, controllerId);

    if (effect.type === EffectType.PutRemainderOnBottomRandom && finalTargetIds.length > 1) ActionProcessor.shuffle(finalTargetIds);

    const processors = getProcessors(state);
    const fromTopResolved = processors.effect.resolveAmount(state, effect.fromTop || 0, context, finalTargetIds);

    if (fromTopResolved > 0 && (effect.sourceZones || []).includes(Zone.Library)) {
      const affectedPlayerId = (finalTargetIds.find((tid: string) => state.players[tid as PlayerId]) as PlayerId) || controllerId;
      return this.resolveLibraryTopMoves(state, { ...effect, fromTop: fromTopResolved }, affectedPlayerId, context);
    }

    if (selectionType === SelectionType.Target && finalTargetIds.length > 0) return this.resolveMoveTargets(state, effect, finalTargetIds, context);
    if (selectionType === SelectionType.Search && (effect.sourceZones || []).includes(Zone.Library)) return SearchEffectHandler.handle(state, effect, context);
    if (selectionType === SelectionType.ALL) return this.resolveMassMove(state, effect, finalTargetIds, context);
    if (effect.type === EffectType.ExileUntilManaValue) return this.resolveExileUntilManaValue(state, effect, controllerId, context);

    if (effect.targetDefinitions && finalTargetIds.length === 0 && !effect.targetMapping) {
      return this.resolveInteractiveMovementSelection(state, effect, controllerId, context);
    }

    return this.resolveSingleTargetMove(state, effect, finalTargetIds, context);
  }

  private static resolveInteractiveMovementSelection(
    state: GameState,
    effect: EffectDefinition,
    controllerId: PlayerId,
    context: ResolutionContext,
  ) {
    const { stackObject } = context;
    const parentContext = context;
    const targetDefinitions = Array.isArray(effect.targetDefinitions)
      ? effect.targetDefinitions[0]
      : effect.targetDefinitions!;
    if (!targetDefinitions) return;

    const player = state.players[controllerId];
    if (!player) return;

    let pool: GameObject[] = [];
    if (targetDefinitions.type === TargetType.CardInHand) pool = player.hand;
    else if (targetDefinitions.type === TargetType.CardInGraveyard) {
      pool = Object.values(state.players).flatMap((p: PlayerState) => p.graveyard);
    } else if (targetDefinitions.type === TargetType.Permanent)
      pool = state.battlefield.filter((o: GameObject) => RuleUtils.getController(o) === controllerId);
    else return;

    const sourceId = stackObject?.sourceId || "";

    const getRestrictions = (td: any) => {
      if (!td) return [];
      const res = [...(td.restrictions || [])];
      const typeStr = td.type as string;
      // Only add types that are actual card types, excluding zone/entity indicators
      if (
        typeStr &&
        !([
          TargetType.Any,
          TargetType.Card,
          TargetType.Player,
          TargetType.Opponent,
          TargetType.AnyTarget,
          TargetType.CardInGraveyard,
          TargetType.CardInHand,
          TargetType.CardInLibrary,
          TargetType.Self,
        ] as TargetType[]).includes(typeStr as TargetType)
      ) {
        res.push(typeStr);
      }
      return res;
    };

    const restrictions = getRestrictions(targetDefinitions);
    const validCandidates = pool.filter((c) =>
      TargetingProcessor.matchesRestrictions(state, c, restrictions, {
        sourceId,
        controllerId,
        stackObject,
      }),
    );

    const { logger, effect: EffectProcessor } = getProcessors(state);

    if (validCandidates.length === 0) {
      logger.info(state, LogCategory.ACTION, 
        `[INFO] MoveEffectHandler: No valid objects found for "${effect.label || "Choice"}". Auto-skipping.`,
      );
      return;
    }

    const resolvedMin =
      targetDefinitions.minCount !== undefined
        ? EffectProcessor.resolveAmount(state, targetDefinitions.minCount as any, context)
        : EffectProcessor.resolveAmount(state, targetDefinitions.count || 1 as any, context);
    const resolvedMax = EffectProcessor.resolveAmount(
      state,
      targetDefinitions.count || 1,
      context,
    );

    state.pendingAction = ChoiceGenerator.createCardChoice(state, pool, {
      label:
        effect.label ||
        `Select up to ${resolvedMax} card${resolvedMax !== 1 ? "s" : ""} to move from your graveyard`,
      playerId: controllerId,
      sourceId: sourceId,
      restrictions: restrictions,
      filterSelectable: true,
      optional: effect.optional,
      minChoices: resolvedMin,
      maxChoices: resolvedMax,
      actionType: effect.optional
        ? ActionType.OptionalAction
        : ActionType.ResolutionChoice,
      onSelected: (c: GameObject) => {
        const subEffects: EffectDefinition[] = [];
        const zone = (effect as MoveEffect).zone || Zone.Hand;
        subEffects.push({
          type: EffectType.MoveToZone,
          targetId: c.id,
          targetPlayerId: controllerId,
          zone: zone,
          tapped: (effect as MoveEffect).tapped,
          reveal: (effect as MoveEffect).reveal,
          effects: effect.effects,
        } as MoveEffect);
        return subEffects;
      },
      stackObj: stackObject,
      parentContext: parentContext,
    });
  }

  private static resolveExileUntilManaValue(
    state: GameState,
    effect: EffectDefinition,
    controllerId: PlayerId,
    context: ResolutionContext,
  ) {
    const { logger } = getProcessors(state);
    const { stackObject, parentContext } = context;
    const player = state.players[controllerId];
    if (!player) return;

    const threshold = typeof (effect as DrawEffect).amount === "number" ? ((effect as DrawEffect).amount as number) : 4;
    let totalMV = 0;
    const cards: GameObject[] = [];
    const { mana: MP } = getProcessors(state);

    // Rule: Rule 701.12: To exile cards until a condition is met
    while (player.library.length > 0 && totalMV < threshold) {
      const card = player.library.pop()!;
      const mv = MP.getManaValue(card.definition.manaCost || "");

      totalMV += mv;
      cards.push(card);
      ActionProcessor.moveCard(state, card, Zone.Exile, controllerId);
      TriggerProcessor.onEvent(
        state,
        {
          type: TriggerEvent.Exile,
          targetId: card.id,
          sourceId: stackObject?.sourceId || "",
          sourceZone: Zone.Library,
        });
    }

    if (cards.length > 0) {
      logger.info(state, LogCategory.ACTION, 
        `[EXILE-UNTIL] Exiled ${cards.length} cards with total MV ${totalMV} (Threshold: ${threshold}).`,
      );

      // Push a choice to cast any number of them
      state.pendingAction = ChoiceGenerator.createCardChoice(state, cards, {
        label: `Cast any number of exiled spells?`,
        playerId: controllerId,
        sourceId: stackObject?.sourceId || "",
        optional: true,
        minChoices: 0,
        maxChoices: cards.length,
        actionType: ActionType.OptionalAction,
        onSelected: (c: GameObject) => {
          const subEffects: EffectDefinition[] = [];
          if (!RuleUtils.isLand(c)) {
            subEffects.push({
              type: EffectType.CastSpell,
              targetId: c.id,
              isFreeCast: true,
            });
          }
          return subEffects;
        },
        stackObj: stackObject,
        parentContext: parentContext,
        isSpellCasting: !!effect.isFreeCast,
        isFreeCast: !!effect.isFreeCast,
      });
    }
  }



  private static resolveLookAtTopAndPick(
    state: GameState,
    effect: EffectDefinition,
    context: ResolutionContext,
    targets: string[] = [],
  ) {
    const { controllerId } = context;
    const moveEff = effect as MoveEffect;
    const processors = getProcessors(state);
    const amount = processors.effect.resolveAmount(
      state,
      (moveEff.fromTop || (moveEff as any).amount || 1) as any,
      context,
      targets,
    );
    const affectedPlayerId =
      (targets.find((tid) => state.players[tid as PlayerId]) as PlayerId) ||
      controllerId;
    return this.resolveLibraryTopMoves(
      state,
      {
        ...effect,
        type: EffectType.LookAtTopAndPick,
        selectionType: "TopN",
        sourceZones: [Zone.Library],
        fromTop: amount,
      } as any,
      affectedPlayerId,
      context,
    );
  }

  private static resolveRevealUntilCondition(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
    const { logger } = getProcessors(state);
    const { controllerId, stackObject } = context;
    const player = state.players[controllerId];
    if (!player) return;

    const revealed: GameObject[] = [];
    let targetCard: GameObject | null = null;

    while (player.library.length > 0) {
      const card = player.library.pop()!;
      ActionProcessor.moveCard(state, card, Zone.Exile, controllerId);

      card.isRevealed = true;
      revealed.push(card);

      if (
        TargetingProcessor.matchesRestrictions(
          state,
          card,
          effect.restrictions || [],
          { sourceId: stackObject?.sourceId || "", controllerId },
        )
      ) {
        targetCard = card;
        break;
      }
    }

    const found = !!targetCard;
    if (revealed.length > 0)
      logger.info(state, LogCategory.ACTION, 
        `[REVEAL-UNTIL] Exiled ${revealed.length} cards from library. Found match: ${found}`,
      );

    // Move non-matching cards (and the match if it wasn't handled) from Exile to bottom
    const remaining = revealed.filter((c) => c !== targetCard);
    if (remaining.length > 0) {
      const remainderZone = effect.remainderZone || Zone.Library;
      const remainderPos = effect.remainderPosition || "bottom";
      const shuffle = effect.shuffleRemainder;

      if (shuffle) {
        ActionProcessor.shuffle(remaining);
      }

      for (const c of remaining) {
        ActionProcessor.moveCard(
          state,
          c,
          remainderZone,
          c.ownerId,
          remainderPos as number | "top" | "bottom",
        );
      }
    }

    if (found && targetCard) {
      // The card is already in Exile now.
      if (effect.next) {
        const nextEffect = effect.next;
        // ARCHITECTURAL NOTE: Cascade Suspension (Rule 702.85)
        // Cascade requires the player to choose whether to cast the revealed card.
        // We set state.pendingAction to suspend the resolution loop until the player makes a choice.
        if (
          nextEffect.type === EffectType.Choice &&
          ((nextEffect as any).choices || (nextEffect as any).choice)
        ) {
          const choicesArr =
            (nextEffect as any).choices || (nextEffect as any).choice?.choices || [];

          state.pendingAction = ChoiceGenerator.createCardChoice(
            state,
            [targetCard],
            {
              label:
                (nextEffect as any).label ||
                (nextEffect as any).choice?.label ||
                `Cast ${targetCard.definition.name}?`,
              playerId: controllerId,
              sourceId: targetCard.id,
              optional: true,
              isSpellCasting: true, // Force true for Cascade
              isFreeCast: true,    // Force true for Cascade
              onSelected: (c: GameObject) => {
                const yesChoice = choicesArr.find(
                  (ch: any) => ch.label === "Yes" || ch.value === "yes",
                );
                return yesChoice?.effects || [];
              },
              onNone: () => {
                const noChoice = choicesArr.find(
                  (ch: any) => ch.label === "No" || ch.value === "no",
                );
                return noChoice?.effects || [];
              },
              targets: [targetCard.id],
              stackObj: stackObject,
              parentContext: context,
            },
          );
          return;
        }
        const { effect: EP } = getProcessors(state);
        EP.executeEffect({
          state,
          effect: nextEffect,
          sourceId: targetCard.id,
          validTargetIds: [targetCard.id],
          parentContext: context,
        });
        if (state.pendingAction) return;
      }
    }
  }

  private static resolveExchangeHandAndGraveyard(state: GameState, effect: EffectDefinition, targets: string[], controllerId: PlayerId) {
    const { logger } = getProcessors(state);
    const playerIds =
      targets.length > 0 ? targets.map((t) => t as PlayerId) : [controllerId];
    playerIds.forEach((pid) => {
      const player = state.players[pid];
      if (player) {
        const oldHand = [...player.hand];
        const oldGY = [...player.graveyard];
        logger.info(state, LogCategory.ACTION, `[EXCHANGE] Swapping hand/graveyard for ${player.name}.`);
        oldGY.forEach((c) =>
          ActionProcessor.moveCard(state, c, Zone.Hand, pid),
        );
        oldHand.forEach((c) =>
          ActionProcessor.moveCard(state, c, Zone.Graveyard, pid),
        );
      }
    });
  }

  private static resolveMoveTargets(state: GameState, effect: EffectDefinition, targetIds: string[], context: ResolutionContext) {
    const { logger } = getProcessors(state);
    const { controllerId, stackObject } = context;
    const parentContext = context;
    const moveEff = effect as MoveEffect;
    const zone = moveEff.zone || Zone.Hand;
    const isDiscard =
      effect.type === EffectType.DiscardCards || effect.isDiscard;

    targetIds.forEach((tid: string) => {
      logger.debug(state, LogCategory.ACTION, `[MOVE-DEBUG] Resolving movement for target ${tid} to zone ${zone}`);
      if (state.players[tid as PlayerId]) {
        // If the target is a player and we have a selection definition, open the card picker
        if (moveEff.targetDefinitions) {
          this.resolveInteractiveMovementSelection(
            state,
            effect,
            tid as PlayerId,
            context,
          );
        }
        return;
      }

      const obj = this.findObject(state, tid, context);
      logger.debug(state, LogCategory.ACTION, `[DEBUG] MoveEffectHandler.resolveMoveTargets: findObject for ${tid} returned ${obj ? obj.definition.name + " in " + obj.zone : "null"}`);
      if (obj) {
        const from = obj.zone;
        const destPlayerId = moveEff.ownerControl ? obj.ownerId : controllerId;
        ActionProcessor.moveCard(state, obj, zone as Zone, destPlayerId, moveEff.libraryPosition as number | "top" | "bottom", false, isDiscard);
        if (zone === Zone.Hand || zone === Zone.Library) {
          obj.isRevealed = true;
        }
        if (zone === Zone.Battlefield && moveEff.tapped) {
          obj.isTapped = true;
        }
        if (zone === Zone.Exile) {
          state.turnState.lastExiledIds = [tid];
        }

        if (stackObject) {
          if (!stackObject.data) stackObject.data = {};
          if (!stackObject.data.exiledIds) stackObject.data.exiledIds = [];
          if (!stackObject.data.exiledIds.includes(tid)) {
            stackObject.data.exiledIds.push(tid);
            logger.debug(state, LogCategory.ACTION, `[DEBUG] MoveEffectHandler: Added ${tid} to stackObject.data.exiledIds. Current: ${stackObject.data.exiledIds.join(', ')}`);
          }
        }

        if (parentContext) {
          if (!parentContext.exiledIds) parentContext.exiledIds = [];
          if (!parentContext.exiledIds.includes(tid)) {
            parentContext.exiledIds.push(tid);
          }
        }

        if (zone === Zone.Exile) {
          TriggerProcessor.onEvent(
            state,
            {
              type: TriggerEvent.Exile,
              targetId: tid,
              sourceId: stackObject?.sourceId || "",
              sourceZone: from,
            });
        }

        // Handle starting counters (Rule 614.1c replacement-style entry)
        if ((effect as any).startingCounters && zone === Zone.Battlefield) {
          const sc = (effect as any).startingCounters;
          const cType = sc.type || sc.counterType || sc.countersType || "p1p1";
          const finalType =
            cType.toLowerCase() === "p1p1" || cType === "+1/+1"
              ? "+1/+1"
              : cType;
          const processors = getProcessors(state);
          const resolvedAmount = processors.effect.resolveAmount(
            state,
            sc.amount as any,
            context,
            [tid],
          );

          if (resolvedAmount > 0) {
            const obj = state.battlefield.find((o) => o.id === tid);
            if (obj) {
              obj.counters[finalType] =
                (obj.counters[finalType] || 0) + resolvedAmount;
              logger.info(state, LogCategory.ACTION, 
                `[COUNTERS] ${obj.definition.name} enters with ${resolvedAmount} ${finalType} counter(s).`,
              );
            }
          }
        }

        // --- NESTED EFFECTS SUPPORT ---
        if (effect.effects && effect.effects.length > 0) {
          const { effect: EP_LOCAL } = getProcessors(state);
          EP_LOCAL.resolveEffects({
            state,
            effects: effect.effects,
            sourceId: stackObject?.sourceId || tid,
            targets: [tid],
            startIndex: 0,
            stackObject,
            parentContext: context,
          });
        }
      }
    });
  }

  private static resolveLibraryTopMoves(state: GameState, effect: EffectDefinition, controllerId: PlayerId, context: ResolutionContext) {
    const { logger } = getProcessors(state);
    const { stackObject } = context;
    const parentContext = context;
    const player = state.players[controllerId];
    if (!player) return;

    const moveEff = effect as MoveEffect;
    const fromTop = moveEff.fromTop || 0;
    const zone = moveEff.zone || Zone.Hand;
    const cards: GameObject[] = [];

    // CR 121.2: If a player is forbidden from drawing cards, draw effects are ignored.
    if (effect.isDraw && !RestrictionValidator.canDrawCards(state, controllerId)) {
      logger.info(state, LogCategory.ACTION, `${player.name} cannot draw cards due to a restriction.`);
      return;
    }

    // Pop from library to temporary 'Looking' pool
    for (let i = 0; i < Number(fromTop) && player.library.length > 0; i++) {
      cards.push(player.library.pop()!);
    }

    if (cards.length === 0) return;

    if (effect.type === EffectType.LookAtTopAndPick) {
      state.pendingAction = ChoiceGenerator.createCardChoice(state, cards, {
        label: effect.label || `Choose a card from the top ${cards.length}`,
        playerId: controllerId,
        sourceId: stackObject?.sourceId || "",
        restrictions: effect.restrictions,
        reveal: moveEff.reveal,
        optional: effect.optional || effect.selectionType === SelectionType.ANY,
        minChoices:
          effect.selectionType === SelectionType.ANY || (effect as any).amount === "ANY"
            ? 0
            : 1,
        maxChoices: (() => {
          if (effect.selectionType === SelectionType.ANY || (effect as any).amount === "ANY") {
            return cards.length;
          }
          const processors = getProcessors(state);
          const resolved = processors.effect.resolveAmount(state, (effect as any).amount || 1 as any, context, cards.map(c => c.id));
          return Math.min(cards.length, resolved);
        })(),
        actionType:
          effect.optional || effect.selectionType === SelectionType.ANY
            ? ActionType.OptionalAction
            : ActionType.ResolutionChoice,
        onSelected: (selectedCard: GameObject) => {
          // Per-card movement response
          const subEffects: EffectDefinition[] = [];

          if (typeof (effect as any).onSelected === "function") {
            const custom = (effect as any).onSelected(selectedCard);
            if (Array.isArray(custom)) subEffects.push(...custom);
          } else {
            subEffects.push({
              type: EffectType.MoveToZone,
              targetId: selectedCard.id,
              zone: zone,
              tapped: moveEff.tapped,
              reveal: moveEff.reveal,
              isFreeCast: effect.isFreeCast,
            } as MoveEffect);
          }

          if (effect.isFreeCast) {
            subEffects.push({
              type: EffectType.CastSpell,
              targetId: selectedCard.id,
              isFreeCast: true,
            });
          }

          if ((effect as any).additionalEffectPerCard) {
            subEffects.push((effect as any).additionalEffectPerCard);
          }

          return subEffects;
        },
        onNone: () => {
          // If skip, all return to library
          return [
            {
              type: EffectType.MoveToZone,
              selectionType: SelectionType.Target,
              targetIds: cards.map((o) => o.id),
              zone: effect.remainderZone || Zone.Library,
              libraryPosition:
                effect.remainderPosition || moveEff.libraryPosition || "bottom",
            } as MoveEffect,
          ];
        },
        stackObj: stackObject,
        parentContext: parentContext,
        isSpellCasting: !!(effect as any).isSpellCasting,
        isFreeCast: !!(effect as any).isFreeCast,
      });

      // --- BATCH REMAINDER FIX ---
      // We inject the remainder movement as a trailing effect in the parent context if we are in a resolution.
      // This ensures it only runs once AFTER all choices are made.
      const remainderMove = {
        type: EffectType.MoveToZone,
        selectionType: SelectionType.ALL,
        targetMapping: "REMAINDER_OF_POOL",
        zone: effect.remainderZone || Zone.Library,
        libraryPosition:
          effect.remainderPosition || moveEff.libraryPosition || "bottom",
        shuffle: effect.shuffleRemainder,
      } as MoveEffect;

      // If we don't have a parent effects array to splice into (e.g. top-level trigger),
      // we must ensure we have one in the context so ChoiceProcessor/EffectProcessor can pick it up.
      if (!context.effects) {
        context.effects = [effect];
        context.nextEffectIndex = 0;
      }

      context.effects.splice(
        (context.nextEffectIndex || 0) + 1,
        0,
        remainderMove as any,
      );

      return;
    }

    if (effect.type === EffectType.Scry) {
      state.pendingAction = ChoiceGenerator.createScryChoice(state, cards, {
        label: `Scry ${cards.length}`,
        playerId: controllerId,
        sourceId: stackObject?.sourceId || "",
        stackObj: stackObject,
        parentContext: parentContext,
        isSpellCasting: !!(effect as any).isSpellCasting,
        isFreeCast: !!(effect as any).isFreeCast,
      });
      return;
    }

    if (effect.type === EffectType.Surveil) {
      state.pendingAction = ChoiceGenerator.createSurveilChoice(state, cards, {
        label: `Surveil ${cards.length}`,
        playerId: controllerId,
        sourceId: stackObject?.sourceId || "",
        stackObj: stackObject,
        parentContext: parentContext,
        isSpellCasting: !!(effect as any).isSpellCasting,
        isFreeCast: !!(effect as any).isFreeCast,
      });
      return;
    }

    // Default: Automatic move (Draw, Mill, Exile)
    if (zone === Zone.Exile) {
      state.turnState.lastExiledIds = cards.map((c) => c.id);
    }
    if (effect.type === EffectType.Mill) {
      state.turnState.lastMilledIds = cards.map((c) => c.id);
    }
    cards.forEach((c) => {
      const from = c.zone;
      ActionProcessor.moveCard(state, c, zone as Zone, controllerId, "top", effect.type === EffectType.DrawCards);
      if (zone === Zone.Battlefield) {
        if (moveEff.tapped) c.isTapped = true;
      }
      if (zone === Zone.Exile) {
        if (stackObject) {
          if (!stackObject.data) stackObject.data = {};
          if (!stackObject.data.exiledIds) stackObject.data.exiledIds = [];
          if (!stackObject.data.exiledIds.includes(c.id)) {
            stackObject.data.exiledIds.push(c.id);
            logger.debug(state, LogCategory.ACTION, `[DEBUG] MoveEffectHandler: Added library card ${c.id} to stackObject.data.exiledIds. Current: ${stackObject.data.exiledIds.join(', ')}`);
          }
        }

        if (parentContext) {
          if (!parentContext.exiledIds) parentContext.exiledIds = [];
          if (!parentContext.exiledIds.includes(c.id)) {
            parentContext.exiledIds.push(c.id);
          }
        }
        TriggerProcessor.onEvent(
          state,
          {
            type: TriggerEvent.Exile,
            targetId: c.id,
            sourceId: stackObject?.sourceId || "",
            sourceZone: from,
          });
      }
    });

    // --- NESTED EFFECTS SUPPORT ---
    if (effect.effects && effect.effects.length > 0) {
      const { effect: EP_LOCAL } = getProcessors(state);
      EP_LOCAL.resolveEffects({
        state,
        effects: effect.effects,
        sourceId: stackObject?.sourceId || controllerId,
        targets: cards.map((c) => c.id),
        startIndex: 0,
        stackObject,
        parentContext: context,
      });
    }
  }


  private static resolveMassMove(state: GameState, effect: EffectDefinition, targetIds: string[], context: ResolutionContext) {
    const { logger } = getProcessors(state);
    const { controllerId, stackObject } = context;
    const moveEff = effect as MoveEffect;
    const zone = moveEff.zone || Zone.Hand;
    const isDiscard = effect.type === EffectType.DiscardCards || effect.isDiscard;

    // 1. Collect all cards to move
    let cardsToMove: GameObject[] = [];

    // Mode A: Direct card IDs or Special Mapping
    const directCardIds = targetIds.filter(id => !state.players[id as PlayerId]);
    
    if (moveEff.targetMapping === "REMAINDER_OF_POOL") {
      cardsToMove = (context.lookingCards || []).filter(c => c.zone === Zone.Library);
      logger.debug(state, LogCategory.ACTION, `[MOVE-DEBUG] REMAINDER_OF_POOL: Found ${cardsToMove.length} cards remaining in library pool.`);
    } else if (directCardIds.length > 0) {
      directCardIds.forEach(id => {
        const obj = this.findObject(state, id, context);
        if (obj) cardsToMove.push(obj);
      });
    } else {
      // Mode B: Player IDs (find cards in their zones matching restrictions)
      const targetPlayerIds = targetIds.length > 0 ? targetIds : [controllerId];
      const sources = moveEff.sourceZones || [Zone.Battlefield];

      targetPlayerIds.forEach((tid) => {
        const player = state.players[tid as PlayerId];
        if (player) {
          let playerPool = (sources as Zone[]).flatMap((z: Zone) => {
            if (z === Zone.Graveyard) return [...player.graveyard];
            if (z === Zone.Hand) return [...player.hand];
            if (z === Zone.Library) return [...player.library];
            if (z === Zone.Battlefield) return state.battlefield.filter((o) => RuleUtils.getController(o) === tid);
            return [];
          });
          cardsToMove.push(...playerPool);
        }
      });
    }

    // 2. Apply restrictions if present (Secondary filter)
    if (effect.restrictions) {
      cardsToMove = cardsToMove.filter((o) =>
        TargetingProcessor.matchesRestrictions(state, o, effect.restrictions!, {
          sourceId: stackObject?.sourceId || "",
          controllerId,
        })
      );
    }

    // 3. Shuffle if requested
    if (moveEff.shuffle) {
      ActionProcessor.shuffle(cardsToMove);
    }

    // 4. Move the cards
    cardsToMove.forEach((c) => {
      const from = c.zone;
      ActionProcessor.moveCard(state, c, zone as Zone, c.ownerId, "top", false, isDiscard);
      if (zone === Zone.Exile) {
        TriggerProcessor.onEvent(state, { type: TriggerEvent.Exile, targetId: c.id, sourceId: stackObject?.sourceId || "", sourceZone: from });
      }
    });

    // 4. --- NESTED EFFECTS SUPPORT ---
    if (effect.effects && effect.effects.length > 0) {
      const { effect: EP_LOCAL } = getProcessors(state);
      EP_LOCAL.resolveEffects({
        state,
        effects: effect.effects,
        sourceId: stackObject?.sourceId || controllerId,
        targets: cardsToMove.map(c => c.id),
        startIndex: 0,
        stackObject,
        parentContext: context,
      });
    }
  }

  private static resolveSingleTargetMove(state: GameState, effect: EffectDefinition, targetIds: string[], context: ResolutionContext) {
    const { logger } = getProcessors(state);
    const { controllerId, stackObject } = context;
    const parentContext = context;
    const moveEff = effect as MoveEffect;
    const idsToMove = effect.targetId
      ? [effect.targetId]
      : targetIds;
    let zone = moveEff.zone;
    if (!zone) {
      if (effect.type === EffectType.Exile) zone = Zone.Exile;
      else if (effect.type === EffectType.PutOnBattlefield)
        zone = Zone.Battlefield;
      else zone = Zone.Hand;
    }
    const isDiscard =
      effect.type === EffectType.DiscardCards || effect.isDiscard;

    idsToMove.forEach((tid) => {
      const obj = this.findObject(state, tid, context);
      logger.debug(state, LogCategory.ACTION, `[DEBUG] MoveEffectHandler: findObject for ${tid} returned ${obj ? obj.definition.name + " in " + obj.zone : "null"}`);
      if (!obj) {
        logger.warn(state, LogCategory.ACTION, `[WARNING] MoveEffectHandler: Could not find object with id ${tid} to move.`);
        return;
      }

      const from = obj.zone;
      const destPlayerId = moveEff.ownerControl ? obj.ownerId : controllerId;
      logger.debug(state, LogCategory.ACTION, `[DEBUG] MoveEffectHandler: Moving ${obj.definition.name} from ${from} to ${zone} for player ${destPlayerId}`);
      ActionProcessor.moveCard(state, obj, zone as Zone, destPlayerId, moveEff.libraryPosition as number | "top" | "bottom", false, isDiscard);

      if (
        (moveEff.reveal || effect.revealed) &&
        zone !== Zone.Battlefield
      ) {
        obj.isRevealed = true;
      }

      if (moveEff.tapped && zone === Zone.Battlefield) obj.isTapped = true;
      if (zone === Zone.Exile) {
        if (parentContext) {
          if (!parentContext.exiledIds) parentContext.exiledIds = [];
          parentContext.exiledIds.push(obj.id);
        }
        TriggerProcessor.onEvent(
          state,
          {
            type: TriggerEvent.Exile,
            targetId: obj.id,
            sourceId: stackObject?.sourceId || "",
            sourceZone: from,
          });
      }

      // --- CHAINING ---
      const subEffects = effect.next ? [effect.next] : effect.effects;
      if (subEffects && subEffects.length > 0) {
        const { effect: EP_LOCAL } = getProcessors(state);
        EP_LOCAL.resolveEffects({
          state,
          effects: subEffects,
          sourceId: stackObject?.sourceId || (context as any).sourceId || "",
          targets: targetIds,
          stackObject,
          parentContext: context,
        });
      }
    });
  }

  private static findObject(state: GameState, id: string, context: ResolutionContext): GameObject | undefined {
    const { stackObject } = context;
    if (stackObject && stackObject.id === id) {
      if (stackObject.card) return stackObject.card;
      if (stackObject.definition) return stackObject as any;
    }

    // Search looking pools (important for library-top interactive choices)
    const looking = (state.pendingAction?.data as any)?.lookingCards ||
      context?.lookingCards ||
      stackObject?.data?.lookingCards ||
      [];
    const inPool = looking.find((o: GameObject) => o.id === id);
    if (inPool) return inPool;

    return RuleUtils.findObject(state, id) || undefined;
  }
}