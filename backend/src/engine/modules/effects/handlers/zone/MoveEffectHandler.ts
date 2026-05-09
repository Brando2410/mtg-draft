import {
  ActionType,
  CounterType,
  DrawEffect,
  EffectDefinition,
  EffectType,
  GameObject,
  GameState,
  MoveEffect,
  PlayerId,
  PlayerState,
  EngineFrame,
  SearchEffect,
  SelectionType,
  TargetMapping,
  TargetType,
  TriggerEvent,
  Zone,
  BatchActionData,
  ModalEffect,
  TargetDefinition
} from "@shared/engine_types";
import { IEffectHandler } from "../../IEffectHandler";
import { LogCategory } from "../../../../utils/EngineLogger";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { ActionProcessor } from "../../../actions/ActionProcessor";
import { TargetingProcessor } from "../../../actions/targeting/TargetingProcessor";
import { RestrictionValidator } from "../../../core/RestrictionValidator";
import { getProcessors } from "../../../ProcessorRegistry";
import { ChoiceGenerator } from "../../ChoiceGenerator";
import { TriggerProcessor } from "../../triggers/TriggerProcessor";
import { SearchEffectHandler } from "./SearchEffectHandler";
import { EffectProcessor } from "../../EffectProcessor";
import { DrawCardsHandler } from "./DrawCardsHandler";

/**
 * Strategy for CR 701: Keyword Actions (Zone Movement)
 */
export class MovementHandlerClass implements IEffectHandler<EffectDefinition> {
  public handle(state: GameState, effect: EffectDefinition, context: EngineFrame): void | boolean {
    const { logger } = getProcessors(state);
    const { targets = [], controllerId, stackObject, parentContext } = context || {};
    const affectedPlayerId = (targets.find(tid => state.players[tid as PlayerId]) as PlayerId) || controllerId;


    const targetMapping = effect.targetMapping || ((effect.targetDefinitions || effect.targetIds) ? undefined : TargetMapping.TargetAll);
    const processors = getProcessors(state);

    let targetIds: string[] = effect.targetIds || [];
    if (targetMapping) {
      targetIds = processors.targeting.resolveTargetMapping(state, targetMapping, context, effect);
    } else if (targetIds.length === 0 && targets.length > 0 && !parentContext) {
      targetIds = targets;
    }

    // Fallback to stack targets ONLY if this is a top-level effect resolution and no targets were provided
    const finalTargetIds =
      targetIds.length === 0 && !parentContext
        ? stackObject?.targets || []
        : targetIds;

    let selectionType = effect.selectionType;
    if (!selectionType) {
      if (effect.type === EffectType.SearchLibrary) selectionType = SelectionType.Search;
      else selectionType = (effect.targetMapping === TargetMapping.AllMatchingCards ? SelectionType.ALL : SelectionType.Target);
    }

    // Rule: Resolve default zone for specific movement keywords
    let targetZone = effect.zone;
    if (!targetZone) {
      if (effect.type === EffectType.Exile || effect.type === EffectType.ExileTopCard || effect.type === EffectType.ExileAllCards) {
        targetZone = Zone.Exile;
      } else if (effect.type === EffectType.DrawCards || effect.type === EffectType.ReturnToHand || effect.type === EffectType.MoveToZone) {
        targetZone = Zone.Hand;
      } else if (effect.type === EffectType.DiscardCards || effect.type === EffectType.Mill || effect.type === EffectType.PutInGraveyard) {
        targetZone = Zone.Graveyard;
      } else if (effect.type === EffectType.PutOnBattlefield) {
        targetZone = Zone.Battlefield;
      }
    }

    logger.info(state, LogCategory.ACTION,
      `[MOVE-ZONE] Type: ${effect.type}, Selection: ${selectionType}, Zone: ${targetZone}`,
    );

    const effectiveEffect = { ...effect, zone: targetZone };

    // Map legacy effect types to selection modes if needed
    if (effect.type === EffectType.DrawCards) return DrawCardsHandler.handle(state, effectiveEffect as DrawEffect, context);
    if (effect.type === EffectType.LookAtTopAndPick) return this.resolveLookAtTopAndPick(state, effectiveEffect, context, finalTargetIds);
    if (effect.type === EffectType.RevealUntilCondition) return this.resolveRevealUntilCondition(state, effectiveEffect, context);
    if (effect.type === EffectType.ExchangeHandAndGraveyard) return this.resolveExchangeHandAndGraveyard(state, effectiveEffect, targets, affectedPlayerId);


    const fromTopResolved = processors.effect.resolveAmount(state, effect.fromTop || 0, context, finalTargetIds);

    if (fromTopResolved > 0 && (effect.sourceZones || []).includes(Zone.Library)) {
      const affectedPlayerId = (finalTargetIds.find((tid: string) => state.players[tid as PlayerId]) as PlayerId) || controllerId;
      return this.resolveLibraryTopMoves(state, { ...effectiveEffect, fromTop: fromTopResolved }, affectedPlayerId, context);
    }

    if (selectionType === SelectionType.Target && finalTargetIds.length > 0) return this.resolveMoveTargets(state, effectiveEffect, finalTargetIds, context);
    if (selectionType === SelectionType.Search && (effect.sourceZones || []).includes(Zone.Library)) return SearchEffectHandler.handle(state, effectiveEffect as unknown as SearchEffect, context);
    if (selectionType === SelectionType.ALL) return this.resolveMassMove(state, effectiveEffect, finalTargetIds, context);
    if (effect.type === EffectType.ExileUntilManaValue) return this.resolveExileUntilManaValue(state, effectiveEffect, affectedPlayerId, context);

    if (effect.targetDefinitions && finalTargetIds.length === 0 && !effect.targetMapping) {
      return this.resolveInteractiveMovementSelection(state, effectiveEffect, affectedPlayerId, context);
    }

    return this.resolveSingleTargetMove(state, effectiveEffect, finalTargetIds, context);
  }

  private resolveInteractiveMovementSelection(
    state: GameState,
    effect: EffectDefinition,
    controllerId: PlayerId,
    context: EngineFrame,
  ) {
    const { stackObject } = context;
    const parentContext = context;
    const targetDefinitions = effect.targetDefinitions || [];
    const firstDef = targetDefinitions[0];
    if (!firstDef) return;

    const player = state.players[controllerId];
    if (!player) return;

    let pool: GameObject[] = [];
    const expectedZone = firstDef.zone;

    if (expectedZone === Zone.Hand || firstDef.type === TargetType.CardInHand) pool = player.hand;
    else if (expectedZone === Zone.Graveyard || firstDef.type === TargetType.CardInGraveyard) {
      pool = Object.values(state.players).flatMap((p: PlayerState) => p.graveyard);
    } else if (expectedZone === Zone.Library || firstDef.type === TargetType.CardInLibrary) {
      pool = player.library;
    } else if (expectedZone === Zone.Battlefield || firstDef.type === TargetType.Permanent)
      pool = state.battlefield.filter((o: GameObject) => RuleUtils.getController(o) === controllerId);
    else return;

    const sourceId = context.sourceId || stackObject?.id || "";

    const getRestrictions = (td: TargetDefinition) => {
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

    const restrictions = getRestrictions(firstDef);
    const validCandidates = pool.filter((c) =>
      TargetingProcessor.isLegalTarget(
        state,
        {
          sourceId,
          controllerId,
          stackObject,
          targetDefinitions: effect.targetDefinitions || [],
          targetIndex: 0,
          effects: [],
          targets: []
        },
        c.id
      ),
    );

    const { logger, effect: EffectProcessor } = getProcessors(state);

    if (validCandidates.length === 0) {
      logger.info(state, LogCategory.ACTION,
        `[INFO] MoveEffectHandler: No valid objects found for "${effect.label || "Choice"}". Auto-skipping.`,
      );
      return;
    }

    const resolvedMin =
      firstDef.minCount !== undefined
        ? EffectProcessor.resolveAmount(state, firstDef.minCount, context)
        : EffectProcessor.resolveAmount(state, firstDef.count || 1, context);
    const resolvedMax = EffectProcessor.resolveAmount(
      state,
      firstDef.count || 1,
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
        const moveEff = effect as MoveEffect;
        const zone = moveEff.zone || Zone.Hand;
        subEffects.push({
          type: EffectType.MoveToZone,
          targetIds: [c.id],
          targetPlayerId: controllerId,
          zone: zone,
          tapped: moveEff.tapped,
          reveal: moveEff.reveal,
          effects: effect.effects,
        } as MoveEffect);
        return subEffects;
      },
      stackObj: stackObject,
      parentContext: parentContext,
    });
  }

  private resolveExileUntilManaValue(
    state: GameState,
    effect: EffectDefinition,
    controllerId: PlayerId,
    context: EngineFrame,
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
          payload: {
            targetIds: [card.id],
            sourceId: context.sourceId || stackObject?.id || "",
            sourceZone: Zone.Library,
          }
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
        sourceId: context.sourceId || stackObject?.id || "",
        optional: true,
        minChoices: 0,
        maxChoices: cards.length,
        actionType: ActionType.OptionalAction,
        onSelected: (c: GameObject) => {
          const subEffects: EffectDefinition[] = [];
          if (!RuleUtils.isLand(c)) {
            subEffects.push({
              type: EffectType.CastSpell,
              targetIds: [c.id],
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



  private resolveLookAtTopAndPick(
    state: GameState,
    effect: EffectDefinition,
    context: EngineFrame,
    targets: string[] = [],
  ) {
    const { controllerId } = context;
    const moveEff = effect as MoveEffect;
    const processors = getProcessors(state);
    const amount = processors.effect.resolveAmount(
      state,
      (moveEff.fromTop || moveEff.amount || 1),
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
      } as EffectDefinition,
      affectedPlayerId,
      context,
    );
  }

  private resolveRevealUntilCondition(state: GameState, effect: EffectDefinition, context: EngineFrame) {
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
          { sourceId: context.sourceId || stackObject?.id || "", controllerId, effects: [], targets: [] },
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
      const shuffle = effect.shuffleRemainder || effect.remainderPosition === 'random';
      const remainderPos = effect.remainderPosition === 'random' ? 'bottom' : (effect.remainderPosition || "bottom");

      if (shuffle) {
        ActionProcessor.shuffle(remaining);
      }

      for (const c of remaining) {
        ActionProcessor.moveCard(
          state,
          c,
          remainderZone as Zone,
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
        if (nextEffect.type === EffectType.Choice) {
          const modalEffect = nextEffect as ModalEffect;
          const choicesArr = modalEffect.choices || [];

          state.pendingAction = ChoiceGenerator.createCardChoice(
            state,
            [targetCard],
            {
              label:
                modalEffect.label ||
                `Cast ${targetCard.definition.name}?`,
              playerId: controllerId,
              sourceId: targetCard.id,
              optional: true,
              isSpellCasting: modalEffect.isSpellCasting ?? effect.isSpellCasting,
              isFreeCast: modalEffect.isFreeCast ?? effect.isFreeCast,
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
          context: EP.createEngineFrame(state, {
            sourceId: targetCard.id,
            targets: [targetCard.id],
            parentContext: context,
          }),
        });
        if (state.pendingAction) return;
      }
    }
  }

  private resolveExchangeHandAndGraveyard(state: GameState, effect: EffectDefinition, targets: string[], controllerId: PlayerId) {
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

  private resolveMoveTargets(state: GameState, effect: EffectDefinition, targetIds: string[], context: EngineFrame) {
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
        ActionProcessor.moveCard(state, obj, zone as Zone, destPlayerId!, moveEff.position as number | "top" | "bottom", false, isDiscard);
        if (moveEff.reveal) {
          obj.isRevealed = true;
        }
        if (zone === Zone.Battlefield && moveEff.tapped) {
          obj.isTapped = true;
        }
        if (zone === Zone.Exile) {
          state.turnState.lastExiledIds = [tid];
        }

        if (stackObject) {
          if (!stackObject.exiledIds) stackObject.exiledIds = [];
          if (!stackObject.exiledIds.includes(tid)) {
            stackObject.exiledIds.push(tid);
            logger.debug(state, LogCategory.ACTION, `[DEBUG] MoveEffectHandler: Added ${tid} to stackObject.exiledIds. Current: ${stackObject.exiledIds.join(', ')}`);
          }
          // Legacy sync
          if (!stackObject.data) stackObject.data = {};
          stackObject.data.exiledIds = stackObject.exiledIds;
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
              payload: {
                targetIds: [tid],
                sourceId: context.sourceId || stackObject?.id || "",
                sourceZone: from,
              }
            });
        }

        // Handle starting counters (Rule 614.1c replacement-style entry)
        if (moveEff.startingCounters && zone === Zone.Battlefield) {
          const sc = moveEff.startingCounters;
          const cType = sc.counterType || "p1p1";
          const finalType =
            cType.toLowerCase() === "p1p1" || cType === "+1/+1"
              ? "+1/+1"
              : cType;
          const processors = getProcessors(state);
          const resolvedAmount = processors.effect.resolveAmount(
            state,
            sc.amount,
            context,
            [tid],
          );

          if (resolvedAmount > 0) {
            const obj = state.battlefield.find((o) => o.id === tid);
            if (obj) {
              if (!obj.counters) obj.counters = {};
              const counterKey = finalType as CounterType;
              obj.counters[counterKey] = (obj.counters[counterKey] || 0) + resolvedAmount;
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
            context: EP_LOCAL.createEngineFrame(state, {
              sourceId: context.sourceId || stackObject?.id || tid,
              effects: effect.effects,
              targets: [tid],
              stackObject,
              parentContext: context,
            }),
          });
        }
      }
    });
  }

  private resolveLibraryTopMoves(state: GameState, effect: EffectDefinition, controllerId: PlayerId, context: EngineFrame) {
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

    // Preserve the pool for remainder effects (REMAINDER_OF_POOL)
    context.lookingCards = cards;
    if (stackObject) {
      stackObject.lookingCards = cards;
    }

    if (effect.type === EffectType.LookAtTopAndPick) {
      state.pendingAction = ChoiceGenerator.createCardChoice(state, cards, {
        label: effect.label || `Choose a card from the top ${cards.length}`,
        playerId: controllerId,
        sourceId: context.sourceId || stackObject?.id || "",
        restrictions: effect.restrictions,
        reveal: moveEff.reveal,
        optional: effect.optional || effect.selectionType === SelectionType.ANY,
        minChoices:
          effect.selectionType === SelectionType.ANY || (moveEff.amount === "ANY")
            ? 0
            : 1,
        maxChoices: (() => {
          const count = moveEff.pickCount || moveEff.amount || 1;
          if (effect.selectionType === SelectionType.ANY || count === "ANY") {
            return cards.length;
          }
          const processors = getProcessors(state);
          const resolved = processors.effect.resolveAmount(state, count, context, cards.map(c => c.id));
          return Math.min(cards.length, resolved);
        })(),

        actionType:
          effect.optional || effect.selectionType === SelectionType.ANY
            ? ActionType.OptionalAction
            : ActionType.ResolutionChoice,
        hideUndo: true,
        onSelected: (selectedCard: GameObject) => {
          // Per-card movement response
          const subEffects: EffectDefinition[] = [];

          if (typeof moveEff.onSelected === "function") {
            const custom = moveEff.onSelected(selectedCard);
            if (Array.isArray(custom)) subEffects.push(...custom);
          } else {
            subEffects.push({
              type: EffectType.MoveToZone,
              targetIds: [selectedCard.id],
              zone: zone,
              tapped: moveEff.tapped,
              reveal: moveEff.reveal,
              isFreeCast: effect.isFreeCast,
            } as MoveEffect);
          }

          if (effect.isFreeCast) {
            subEffects.push({
              type: EffectType.CastSpell,
              targetIds: [selectedCard.id],
              isFreeCast: true,
            });
          }

          if (moveEff.additionalEffectPerCard) {
            subEffects.push(moveEff.additionalEffectPerCard);
          }

          return subEffects;
        },
        onNone: () => {
          // Allow the injected remainderMove to handle everything
          return [];
        },
        stackObj: stackObject,
        parentContext: parentContext,
        isSpellCasting: !!effect.isSpellCasting,
        isFreeCast: !!effect.isFreeCast,
      });

      // --- BATCH REMAINDER FIX ---
      // We inject the remainder movement as a trailing effect in the parent context if we are in a resolution.
      // This ensures it only runs once AFTER all choices are made.
      const remainderMove = {
        type: EffectType.MoveToZone,
        selectionType: SelectionType.ALL,
        targetMapping: "REMAINDER_OF_POOL",
        zone: effect.remainderZone || Zone.Library,
        position:
          effect.remainderPosition || moveEff.position || "bottom",
        shuffle: effect.shuffleRemainder,
      } as MoveEffect;

      // Ensure we only inject the remainder move once
      const alreadyHasRemainder = context.effects?.some(e =>
        e.type === EffectType.MoveToZone &&
        e.targetMapping === "REMAINDER_OF_POOL" &&
        (e as MoveEffect).zone === (effect.remainderZone || Zone.Library)
      );

      if (!alreadyHasRemainder) {
        EffectProcessor.injectPostEffect(context, remainderMove as EffectDefinition);
      }
      return;
    }

    if (effect.type === EffectType.Scry) {
      state.pendingAction = ChoiceGenerator.createScryChoice(state, cards, {
        label: `Scry ${cards.length}`,
        playerId: controllerId,
        sourceId: context.sourceId || stackObject?.id || "",
        stackObj: stackObject,
        parentContext: parentContext,
        isSpellCasting: !!effect.isSpellCasting,
        isFreeCast: !!effect.isFreeCast,
      });
      return;
    }

    if (effect.type === EffectType.Surveil) {
      state.pendingAction = ChoiceGenerator.createSurveilChoice(state, cards, {
        label: `Surveil ${cards.length}`,
        playerId: controllerId,
        sourceId: context.sourceId || stackObject?.id || "",
        stackObj: stackObject,
        parentContext: parentContext,
        isSpellCasting: !!effect.isSpellCasting,
        isFreeCast: !!effect.isFreeCast,
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
          if (!stackObject.exiledIds) stackObject.exiledIds = [];
          if (!stackObject.exiledIds.includes(c.id)) {
            stackObject.exiledIds.push(c.id);
            logger.debug(state, LogCategory.ACTION, `[DEBUG] MoveEffectHandler: Added library card ${c.id} to stackObject.exiledIds. Current: ${stackObject.exiledIds.join(', ')}`);
          }
          // Legacy sync
          if (!stackObject.data) stackObject.data = {};
          stackObject.data.exiledIds = stackObject.exiledIds;
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
            payload: {
              targetIds: [c.id],
              sourceId: context.sourceId || stackObject?.id || "",
              sourceZone: from,
            },
          });
      }
    });

    // --- NESTED EFFECTS SUPPORT ---
    if (effect.effects && effect.effects.length > 0) {
      const { effect: EP_LOCAL } = getProcessors(state);
      EP_LOCAL.resolveEffects({
        state,
        context: EP_LOCAL.createEngineFrame(state, {
          sourceId: stackObject?.sourceId || controllerId,
          effects: effect.effects,
          targets: cards.map((c) => c.id),
          stackObject,
          parentContext: context,
        }),
      });
    }
  }


  private resolveMassMove(state: GameState, effect: EffectDefinition, targetIds: string[], context: EngineFrame) {
    const { logger } = getProcessors(state);
    const { controllerId, stackObject } = context;
    const moveEff = effect as MoveEffect;
    const zone = moveEff.zone || Zone.Hand;
    const isDiscard = effect.type === EffectType.DiscardCards || effect.isDiscard;

    // 1. Collect all cards to move
    let cardsToMove: GameObject[] = [];

    // Mode A: Direct card IDs or Special Mapping
    const directCardIds = targetIds.filter(id => !state.players[id as PlayerId]);

    if (moveEff.targetMapping === "REMAINDER_OF_POOL" || moveEff.targetMapping === "REMAINDER_OF_LOOKING_CARDS" || moveEff.targetMapping === TargetMapping.RemainderOfPool || moveEff.targetMapping === TargetMapping.RemainderOfLookingCards) {
      // Use the pre-resolved target IDs to find the actual objects in the pool
      cardsToMove = targetIds.map(id => this.findObject(state, id, context)).filter((o): o is GameObject => !!o);
      logger.debug(state, LogCategory.ACTION, `[MOVE-DEBUG] Remainder Mapping resolved to ${cardsToMove.length} cards.`);
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
          sourceId: context.sourceId || stackObject?.id || "",
          controllerId,
          effects: [],
          targets: []
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
      ActionProcessor.moveCard(state, c, zone as Zone, c.ownerId, moveEff.position as number | "top" | "bottom", false, isDiscard);
      if (zone === Zone.Exile) {
        TriggerProcessor.onEvent(state, { type: TriggerEvent.Exile, payload: { targetIds: [c.id], sourceId: stackObject?.sourceId || "", sourceZone: from } });
      }
    });

    // 4. --- NESTED EFFECTS SUPPORT ---
    if (effect.effects && effect.effects.length > 0) {
      const { effect: EP_LOCAL } = getProcessors(state);
      EP_LOCAL.resolveEffects({
        state,
        context: EP_LOCAL.createEngineFrame(state, {
          sourceId: stackObject?.sourceId || controllerId,
          effects: effect.effects,
          targets: cardsToMove.map(c => c.id),
          stackObject,
          parentContext: context,
        }),
      });
    }
  }

  private resolveSingleTargetMove(state: GameState, effect: EffectDefinition, targetIds: string[], context: EngineFrame) {
    const { logger } = getProcessors(state);
    const { controllerId, stackObject } = context;
    const parentContext = context;
    const moveEff = effect as MoveEffect;
    const idsToMove = (effect.targetIds && effect.targetIds.length > 0)
      ? effect.targetIds
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
      ActionProcessor.moveCard(state, obj, zone as Zone, destPlayerId, moveEff.position as number | "top" | "bottom", false, isDiscard);

      if (
        (moveEff.reveal || effect.reveal) &&
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
            payload: {
              targetIds: [obj.id],
              sourceId: stackObject?.sourceId || "",
              sourceZone: from,
            },
          });
      }

      // --- CHAINING ---
      const subEffects = effect.next ? [effect.next] : effect.effects;
      if (subEffects && subEffects.length > 0) {
        const { effect: EP_LOCAL } = getProcessors(state);
        EP_LOCAL.resolveEffects({
          state,
          context: EP_LOCAL.createEngineFrame(state, {
            sourceId: stackObject?.sourceId || context.sourceId || "",
            effects: subEffects,
            targets: targetIds,
            stackObject,
            parentContext: context,
          }),
        });
      }
    });
  }

  private findObject(state: GameState, id: string, context: EngineFrame): GameObject | undefined {
    const { stackObject, sourceObject } = context;

    // Priority 1: Direct match with sourceObject (handles LKI correctly)
    if (sourceObject && sourceObject.id === id && RuleUtils.isEntity(sourceObject)) return sourceObject as GameObject;

    if (stackObject && stackObject.id === id) {
      if (stackObject.sourceObject) return stackObject.sourceObject;
      if (stackObject.definition) return stackObject as unknown as GameObject;
    }

    // Search looking pools (important for library-top interactive choices)
    const looking = (state.pendingAction?.data as BatchActionData)?.lookingCards ||
      context?.lookingCards ||
      stackObject?.data?.lookingCards ||
      [];
    const inPool = looking.find((o: GameObject) => o.id === id);
    if (inPool) return inPool;

    return RuleUtils.findObject(state, id) as GameObject || undefined;
  }
}
export const MovementHandler = new MovementHandlerClass();

