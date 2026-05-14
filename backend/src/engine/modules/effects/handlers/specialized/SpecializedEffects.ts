import {
  CastSpellEffect,
  DurationType,
  EffectType,
  GameObject,
  MoveEffect,
  Zone,
  EffectDefinition,
} from "@shared/engine_types";
import { IdUtils } from "@shared/utils/IdUtils";
import { LogCategory } from "../../../../utils/EngineLogger";
import { getProcessors, getEngine } from "../../../ProcessorRegistry";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { IEffectHandler } from "../../IEffectHandler";

export const CastSpellHandler: IEffectHandler<CastSpellEffect> = {
  handle(state, effect, context) {
    const { logger, spell: SP, effect: EP } = getProcessors(state);
    const { controllerId, sourceId, stackObject, parentContext, targets } = context;

    const spellName = effect.value;
    const isFree = effect.isFreeCast;
    const isMiracle = effect.isMiracleCast;
    let targetId = (effect.targetIds && effect.targetIds.length > 0) ? effect.targetIds[0] : targets[0];

    logger.debug(state, LogCategory.ACTION, `[DEBUG] SpecializedEffects: CastSpell for ${targetId} (Free: ${isFree}, Miracle: ${isMiracle})`);

    if (spellName && !targetId) {
      const { oracle } = getProcessors(state);
      const cardDef = oracle.getCard(spellName);
      if (!cardDef) {
        logger.error(state, LogCategory.ACTION, `[ERROR] CastSpell: Could not find definition for ${spellName}.`);
        return;
      }

      const copyId = IdUtils.generateId('cast_copy');
      const copy = {
        id: copyId,
        definition: cardDef,
        image_url: cardDef.image_url,
        controllerId: controllerId,
        ownerId: controllerId,
        zone: Zone.Exile,
        isCopy: true,
        isFreeCast: isFree,
        counters: {},
      } as GameObject;

      if (!state.paradigmCopies)
        state.paradigmCopies = {};
      state.paradigmCopies[copyId] = copy;
      targetId = copyId;
    }

    if (targetId) {
      const castObj = EP.findObject(state, targetId, stackObject, parentContext) as GameObject;
      const oldPriority = state.priorityPlayerId;
      state.priorityPlayerId = controllerId;
      const res = SP.playCard(
        state,
        getEngine(state),
        {
          playerId: controllerId,
          cardId: targetId,
          targets: [],
          bypassPriority: true,
          isFreeCast: isFree,
          isMiracleCast: isMiracle,
          parentContext: parentContext,
          exileOnResolution: effect.exileOnResolution
        },
      );
      if (state.priorityPlayerId === controllerId)
        state.priorityPlayerId = oldPriority;
      return res;
    }
    return;
  }
};

export const ExileTopCardsExcessDamageHandler: IEffectHandler<EffectDefinition> = {
  handle(state, effect, context) {
    const { logger, effect: EP } = getProcessors(state);
    const { targets } = context;

    const excessAmt = state.turnState.lastExcessDamageAmount;
    logger.info(state, LogCategory.ACTION, `[EXILE-EXCESS] Exiling top ${excessAmt} cards due to excess damage.`);

    const MEH = EP.getEffectHandler("Exile")!;
    MEH.handle(state, {
      ...effect,
      type: EffectType.Exile,
      amount: excessAmt,
      fromTop: excessAmt,
      sourceZones: [Zone.Library],
    } as MoveEffect, {
      ...context,
    });

    // Add permission to play exiled cards
    if (excessAmt > 0) {
      const exiledIds = state.turnState.lastExiledIds || [];
      if (exiledIds.length > 0) {
        const CEH = EP.getEffectHandler(EffectType.ApplyContinuousEffect)!;
        CEH.handle(state, {
          type: EffectType.ApplyContinuousEffect,
          canPlayExiled: true,
          targetIds: exiledIds,
          duration: effect.duration || {
            type: DurationType.UntilEndOfTurn,
          },
        } as unknown as EffectDefinition, {
          ...context,
          targets: exiledIds
        });
      }
    }
    return;
  }
};

export const ConditionalEffectHandler: IEffectHandler<EffectDefinition> = {
  handle(state, effect, context) {
    const { effect: EP } = getProcessors(state);
    const { sourceId, targets } = context;
    const effects = effect.effects || [];
    return EP.resolveEffects({
      state,
      context: EP.createEngineFrame(state, {
        sourceId,
        effects,
        targets,
        stackObject: context.stackObject,
        parentContext: context.parentContext,
      })
    });
  }
};

export const AdNauseamHandler: IEffectHandler<EffectDefinition> = {
  handle(state, effect, context) {
    const { logger, action: AP, mana: MP, choiceGenerator: ChoiceGenerator } = getProcessors(state);
    const { controllerId } = context;
    const player = state.players[controllerId];
    if (!player || player.library.length === 0) return;

    // 1. Reveal and move
    const card = player.library.pop()!;
    card.isRevealed = true;
    player.hand.push(card);
    card.zone = Zone.Hand;
    logger.info(state, LogCategory.ACTION, `${player.name} reveals ${card.definition.name} and puts it into their hand.`);

    // 2. Lose life
    const mv = MP.getManaValue(card.definition.manaCost || "{0}");
    AP.loseLife(state, controllerId, mv);

    // 3. Choice to repeat
    if (player.library.length > 0) {
      state.pendingAction = ChoiceGenerator.createModalChoice(state, {
        label: `Ad Nauseam: Repeat process? (${player.library.length} cards left)`,
        playerId: controllerId,
        sourceId: context.sourceId,
        stackObj: context.stackObject,
        parentContext: context.parentContext
      }, [
        {
          label: "Repeat",
          value: "repeat",
          effects: [{ type: EffectType.AdNauseam }]
        },
        {
          label: "Stop",
          value: "stop",
          effects: []
        }
      ]);
    }
  }
};

export const ChaosWarpHandler: IEffectHandler<EffectDefinition> = {
  handle(state, effect, context) {
    const { logger, action: AP } = getProcessors(state);
    const { targets } = context;
    const targetId = targets[0];
    const targetObj = RuleUtils.findObject(state, targetId);
    if (!targetObj) return;

    const ownerId = targetObj.ownerId;
    const player = state.players[ownerId];
    if (!player) return;

    // 1. Shuffle into library
    AP.moveCard(state, targetObj as GameObject, Zone.Library, ownerId);
    AP.shuffleLibrary(state, ownerId);

    // 2. Reveal top
    if (player.library.length === 0) return;
    const card = player.library[player.library.length - 1];
    logger.info(state, LogCategory.ACTION, `${player.name} reveals ${card.definition.name} from the top of their library.`);

    // 3. Check if permanent
    const isPermanent = RuleUtils.isPermanent(card);

    if (isPermanent) {
      AP.moveCard(state, card, Zone.Battlefield, ownerId);
    } else {
      AP.shuffleLibrary(state, ownerId);
    }
  }
};

export const ApproachOfTheSecondSunHandler: IEffectHandler<EffectDefinition> = {
  handle(state, effect, context) {
    const { logger, action: AP } = getProcessors(state);
    const { controllerId, sourceId } = context;
    const player = state.players[controllerId];
    if (!player) return;

    const castFromHand = context.stackObject?.sourceObject?.lastNonStackZone === Zone.Hand;
    const castCount = state.gameStats?.castCounts?.[controllerId]?.["Approach of the Second Sun"] || 0;

    if (castFromHand && castCount >= 2) {
      logger.info(state, LogCategory.ACTION, `${player.name} wins the game with Approach of the Second Sun!`);
      AP.winGame(state, controllerId);
    } else {
      AP.gainLife(state, controllerId, 7);

      const stackObj = context.stackObject;
      const card = stackObj?.sourceObject;
      if (card) {
        const pos = Math.max(0, player.library.length - 6);
        AP.moveCard(state, card, Zone.Library, card.ownerId, pos);
        logger.info(state, LogCategory.ACTION, `Approach of the Second Sun put into library at position ${pos} from bottom.`);
        if (stackObj) stackObj.exileOnResolution = true;
      }
    }
  }
};


