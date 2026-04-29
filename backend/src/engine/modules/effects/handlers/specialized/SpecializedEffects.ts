import { DurationType, EffectType, GameObject, Zone } from "@shared/engine_types";
import { IEffectHandler } from "../../IEffectHandler";
import { getProcessors } from "../../../ProcessorRegistry";

export const CastSpellHandler: IEffectHandler = {
  handle(state, effect, log, context) {
    const { spell: SP, effect: EP } = getProcessors(state);
    const { controllerId, sourceId, stackObject, parentContext, targets } = context;

    const spellName = (effect as any).value;
    const isFree = (effect as any).isFreeCast;
    let targetId = (effect as any).targetId || targets[0];

    log(`[DEBUG] SpecializedEffects: CastSpell for ${targetId} (Free: ${isFree})`);

    if (spellName && !targetId) {
      const { oracle } = require("../../../../OracleLogicMap");
      const cardDef = oracle.getCard(spellName);
      if (!cardDef) {
        log(`[ERROR] CastSpell: Could not find definition for ${spellName}.`);
        return;
      }

      const copyId = `cast_copy_${Date.now()}`;
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
      } as any;

      if (!state.paradigmCopies)
        state.paradigmCopies = {};
      state.paradigmCopies[copyId] = copy;
      targetId = copyId;
    }

    if (targetId) {
      const castObj = EP.findObject(state, targetId, stackObject, parentContext) as GameObject;
      if (castObj) {
        if (isFree) {
          (castObj as any).isFreeCast = true;
        }
        if ((effect as any).exileOnResolution) {
          (castObj as any).exileOnResolution = true;
        }
      }
      const oldPriority = state.priorityPlayerId;
      state.priorityPlayerId = controllerId;
      SP.playCard(
        state,
        log,
        state.gameEngine || {
          tapForMana: () => { },
          passPriority: () => { },
          checkAutoPass: () => { },
          checkStateBasedActions: () => { },
        },
        {
          playerId: controllerId,
          cardId: targetId,
          targets: [],
          bypassPriority: true,
          isFreeCast: isFree,
          parentContext: parentContext
        },
      );
      if (state.priorityPlayerId === controllerId)
        state.priorityPlayerId = oldPriority;
    }
    return;
  }
};

export const ExileTopCardsExcessDamageHandler: IEffectHandler = {
  handle(state, effect, log, context) {
    const { effect: EP } = getProcessors(state);
    const { targets } = context;

    const excessAmt = state.turnState.lastExcessDamageAmount;
    log(`[EXILE-EXCESS] Exiling top ${excessAmt} cards due to excess damage.`);

    const { MoveEffectHandler: MEH } = require("../zone/MoveEffectHandler");
    MEH.handle(state, {
      ...effect,
      type: "Exile",
      amount: excessAmt,
      fromTop: excessAmt,
      sourceZones: [Zone.Library],
    } as any, log, {
      ...context,
    });

    // Add permission to play exiled cards
    if (excessAmt > 0) {
      const exiledIds = state.turnState.lastExiledIds || [];
      if (exiledIds.length > 0) {
        const { ContinuousEffectHandler: CEH } = require("../system/ContinuousEffectHandler");
        CEH.handle(state, {
          type: EffectType.ApplyContinuousEffect,
          canPlayExiled: true,
          targetIds: exiledIds,
          duration: effect.duration || {
            type: DurationType.UntilEndOfTurn,
          },
        } as any, log, {
          ...context,
          targets: exiledIds
        });
      }
    }
    return;
  }
};

export const ConditionalEffectHandler: IEffectHandler = {
  handle(state, effect, log, context) {
    const { effect: EP } = getProcessors(state);
    const { sourceId, targets } = context;
    const effects = (effect as any).effects || [];
    return EP.resolveEffects({
      state,
      effects,
      sourceId,
      targets,
      log,
      startIndex: 0,
      stackObject: context.stackObject,
      parentContext: context.parentContext,
    });
  }
};

export const AdNauseamHandler: IEffectHandler = {
  handle(state, effect, log, context) {
    const { action: AP, mana: MP } = getProcessors(state);
    const { ChoiceGenerator } = require("../../../ChoiceGenerator");
    const { controllerId } = context;
    const player = state.players[controllerId];
    if (!player || player.library.length === 0) return;

    // 1. Reveal and move
    const card = player.library.pop()!;
    card.isRevealed = true;
    player.hand.push(card);
    card.zone = Zone.Hand;
    log(`${player.name} reveals ${card.definition.name} and puts it into their hand.`);

    // 2. Lose life
    const mv = MP.getManaValue(card.definition.manaCost || "{0}");
    AP.loseLife(state, controllerId, mv, log);

    // 3. Choice to repeat
    if (player.library.length > 0) {
      ChoiceGenerator.createChoice(state, controllerId, {
        type: 'Choice',
        label: `Ad Nauseam: Repeat process? (${player.library.length} cards left)`,
        choices: [
          {
            label: "Repeat",
            effects: [{ type: EffectType.AdNauseam }]
          },
          {
            label: "Stop",
            effects: []
          }
        ]
      }, context);
    }
  }
};

export const ChaosWarpHandler: IEffectHandler = {
  handle(state, effect, log, context) {
    const { action: AP, targeting: TP } = getProcessors(state);
    const { targets } = context;
    const targetId = targets[0];
    const targetObj = TP.findObjectInAnyZone(state, targetId);
    if (!targetObj) return;

    const ownerId = targetObj.ownerId;
    const player = state.players[ownerId];
    if (!player) return;

    // 1. Shuffle into library
    AP.moveCard(state, targetObj, Zone.Library, ownerId, log);
    AP.shuffleLibrary(state, ownerId, log);

    // 2. Reveal top
    if (player.library.length === 0) return;
    const card = player.library[player.library.length - 1];
    log(`${player.name} reveals ${card.definition.name} from the top of their library.`);

    // 3. Check if permanent
    const permanentTypes = ['Creature', 'Artifact', 'Enchantment', 'Land', 'Planeswalker'];
    const isPermanent = card.definition.types.some(t => permanentTypes.includes(t));

    if (isPermanent) {
      AP.moveCard(state, card, Zone.Battlefield, ownerId, log);
    } else {
      AP.shuffleLibrary(state, ownerId, log);
    }
  }
};

export const ApproachOfTheSecondSunHandler: IEffectHandler = {
  handle(state, effect, log, context) {
    const { action: AP } = getProcessors(state);
    const { controllerId, sourceId } = context;
    const player = state.players[controllerId];
    if (!player) return;

    const castFromHand = context.stackObject?.card?.lastNonStackZone === Zone.Hand;
    const castCount = state.gameStats?.castCounts[controllerId]["Approach of the Second Sun"] || 0;

    if (castFromHand && castCount >= 2) {
      log(`${player.name} wins the game with Approach of the Second Sun!`);
      AP.winGame(state, controllerId, log);
    } else {
      AP.gainLife(state, controllerId, 7, log);
      
      const stackObj = state.stack.find(s => s.id === sourceId);
      const card = stackObj?.card;
      if (card) {
        const pos = Math.max(0, player.library.length - 6);
        AP.moveCard(state, card, Zone.Library, card.ownerId, log, pos);
        log(`Approach of the Second Sun put into library at position ${pos} from bottom.`);
        if (stackObj) stackObj.exileOnResolution = true; 
      }
    }
  }
};


