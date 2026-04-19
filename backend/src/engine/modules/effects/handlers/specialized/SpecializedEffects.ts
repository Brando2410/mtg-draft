import { IEffectHandler } from "../../IEffectHandler";
import { Zone, DurationType, EffectType } from "@shared/engine_types";

export const CastSpellHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        const { SpellProcessor } = require("./../../actions/SpellProcessor");
        const { EffectProcessor } = require("../../EffectProcessor");
        const { controllerId, sourceId, stackObject, parentContext, targets } = context;
        
        const spellName = (effect as any).value;
        const isFree = (effect as any).isFreeCast;
        let targetId = (effect as any).targetId || targets[0];

        log(`[DEBUG] SpecializedEffects: CastSpell for ${targetId} (Free: ${isFree})`);

        if (spellName && !targetId) {
          const { oracle } = require("../../../OracleLogicMap");
          const cardDef = oracle.getCard(spellName);
          if (!cardDef) {
            log(`[ERROR] CastSpell: Could not find definition for ${spellName}.`);
            return;
          }

          const copyId = `cast_copy_${Date.now()}`;
          const copy = {
            id: copyId,
            definition: cardDef,
            controllerId: controllerId,
            ownerId: controllerId,
            zone: Zone.Exile,
            isCopy: true,
            isFreeCast: isFree,
            counters: {},
          } as any;

          if (!(state as any).paradigmCopies)
            (state as any).paradigmCopies = {};
          (state as any).paradigmCopies[copyId] = copy;
          targetId = copyId;
        }

        if (targetId) {
          const castObj = EffectProcessor.findObject(state, targetId, stackObject, parentContext);
          if (castObj && isFree) {
            (castObj as any).isFreeCast = true;
          }
          const oldPriority = state.priorityPlayerId;
          state.priorityPlayerId = controllerId;
          SpellProcessor.playCard(
            state,
            log,
            (state as any).gameEngine || {
              tapForMana: () => {},
              passPriority: () => {},
              checkAutoPass: () => {},
              checkStateBasedActions: () => {},
            },
            {
              playerId: controllerId,
              cardId: targetId,
              targets: [],
              bypassPriority: true,
              isFreeCast: isFree,
            },
          );
          if (state.priorityPlayerId === controllerId)
            state.priorityPlayerId = oldPriority;
        }
        return;
    }
};

export const ParadigmHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        const { ActionProcessor } = require("../../../actions/ActionProcessor");
        const { AbilityType } = require("@shared/engine_types");
        const { EffectProcessor } = require("../../EffectProcessor");
        const { controllerId, sourceId, stackObject, parentContext } = context;
        
        const sourceObj = EffectProcessor.findObject(state, sourceId, stackObject);
        const resolvingStackObj = stackObject || parentContext?.stackObject;
        const spellName =
          resolvingStackObj?.card?.definition.name ||
          (sourceObj as any)?.definition?.name;
        if (!spellName) return;

        // 1. Exile the spell
        if (resolvingStackObj) {
          resolvingStackObj.exileOnResolution = true;
          if (resolvingStackObj.card) {
            ActionProcessor.moveCard(
              state,
              resolvingStackObj.card,
              Zone.Exile,
              controllerId,
              log,
            );
          }
        }

        // 2. Register first-main-phase recurring trigger
        state.ruleRegistry.triggeredAbilities.push({
          type: AbilityType.Triggered,
          eventMatch: "ON_BEGIN_PHASE_PRECOMBAT_MAIN",
          condition: "IS_YOUR_TURN",
          id: `paradigm_${controllerId}_${spellName}_${Date.now()}`,
          sourceId: sourceId,
          controllerId: controllerId,
          activeZone: Zone.Command, // Virtual rule
          effects: [
            {
              type: EffectType.Choice,
              label: `Paradigm: Cast ${spellName}?`,
              choices: [
                {
                  label: `Cast copy of ${spellName}`,
                  effects: [
                    {
                      type: EffectType.CastSpell,
                      isFreeCast: true,
                      isParadigmCopy: true,
                      value: spellName,
                    },
                  ],
                },
                { label: "Decline", effects: [] },
              ],
            },
          ],
        } as any);
        log(`[PARADIGM] Registered recurring recast trigger for ${spellName}.`);
        return;
    }
};

export const ExileTopCardsExcessDamageHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        const { MoveEffectHandler } = require("../zone/MoveEffectHandler");
        const { ContinuousEffectHandler } = require("../system/ContinuousEffectHandler");
        const { targets } = context;
        
        const excessAmt = state.turnState.lastExcessDamageAmount;
        log(`[EXILE-EXCESS] Exiling top ${excessAmt} cards due to excess damage.`);

        MoveEffectHandler.handle(state, {
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
          const exiledIds = (state as any).lastExiledIds || [];
          if (exiledIds.length > 0) {
            ContinuousEffectHandler.handle(state, {
              type: "ApplyContinuousEffect",
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
        const { EffectProcessor } = require("../../EffectProcessor");
        const { sourceId, targets } = context;
        const effects = (effect as any).effects || [];
        return EffectProcessor.resolveEffects({
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


