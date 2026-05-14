import { AddManaEffect, EffectType, PlayerId, ManaPool } from "@shared/engine_types";
import { getProcessors } from "../../../ProcessorRegistry";
import { IEffectHandler } from "../../IEffectHandler";
import { LogCategory } from "../../../../utils/EngineLogger";
import { RuleUtils } from "../../../../utils/RuleUtils";

export const ManaHandler: IEffectHandler = {
  handle(state, effect, context) {
    const { logger, mana: MP } = getProcessors(state);
    const { controllerId, targets, sourceId, stackObject, parentContext } = context;

    if (effect.type === EffectType.AddMana) {
      const manaEffect = effect as AddManaEffect;
      const effectiveTargets = (targets && targets.length > 0) ? targets : [controllerId];

      let manaStr = manaEffect.manaType || 'C';
      const isFlexible = String(manaStr).toUpperCase() === 'ANY' || String(manaStr).toUpperCase() === '{ANY}';

      if (isFlexible) {
        const preChoice = stackObject?.preSelectedChoice;
        if (preChoice !== undefined) {
          const colors = ['W', 'U', 'B', 'R', 'G'];
          const chosenColor = colors[preChoice as number];
          if (chosenColor) {
            manaStr = chosenColor;
          } else {
            manaStr = 'C';
          }
        } else {
          const tid = effectiveTargets[0];
          const p = state.players[tid as PlayerId];
          if (p) {
            const colors = ['W', 'U', 'B', 'R', 'G'];
            const choices = colors.map(c => ({
              label: `{${c}}`,
              value: c,
              effects: [{
                ...effect,
                manaType: c,
                amount: effect.amount || 1
              } as AddManaEffect]
            }));

            const { choiceGenerator: ChoiceGenerator } = getProcessors(state);
            state.pendingAction = ChoiceGenerator.createModalChoice(state, {
              label: "Choose a color of mana to add",
              playerId: tid,
              sourceId: sourceId || "",
              stackObj: stackObject,
              parentContext: parentContext,
              showCancel: true
            }, choices);
          }
          return;
        }
      }

      effectiveTargets.forEach(tid => {
        const p = state.players[tid];
        if (p) {
          const amount = RuleUtils.resolveAmount(state, manaEffect.amount, context) || 1;
          logger.debug(state, LogCategory.ACTION, `[MANA-HANDLER] Adding mana. Type: ${manaStr}, Amount: ${amount} (Original: ${manaEffect.amount})`);

          // Ensure braces if missing
          const formattedMana = String(manaStr).startsWith('{') ? String(manaStr) : `{${manaStr}}`;
          const res = MP.parseManaCost(formattedMana);

          const restrictionList = manaEffect.manaRestrictions || null;

          if (restrictionList) {
            const newRestricted = [...(p.restrictedMana || [])];
            Object.entries(res.colored).forEach(([s, a]) => {
              const total = a * amount;
              if (total > 0) {
                newRestricted.push({ color: s as keyof ManaPool, amount: total, restrictions: restrictionList });
                logger.info(state, LogCategory.ACTION, `[MANA] Produced {${s}} x ${total} (Restricted: ${restrictionList.join(', ')})`);
              }
            });
            if (res.generic > 0) {
              const total = res.generic * amount;
              newRestricted.push({ color: 'C', amount: total, restrictions: restrictionList });
              logger.info(state, LogCategory.ACTION, `[MANA] Produced {C} x ${total} (Restricted: ${restrictionList.join(', ')})`);
            }
            p.restrictedMana = newRestricted;
          } else {
            // Update manaPool with a new object reference to ensure UI/Socket change detection
            const newPool = { ...p.manaPool };
            Object.entries(res.colored).forEach(([s, a]) => {
              const total = (a as number) * amount;
              if (total > 0) {
                newPool[s as keyof ManaPool] += total;
                logger.info(state, LogCategory.ACTION, `[MANA] Produced {${s}} x ${total}`);
              }
            });
            const genericTotal = res.generic * amount;
            if (genericTotal > 0) {
              newPool.C += genericTotal;
              logger.info(state, LogCategory.ACTION, `[MANA] Produced {C} x ${genericTotal}`);
            }
            p.manaPool = newPool;
          }
        }
      });
      return;
    }
  }
};
