import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const WitherbloomtheBalancer: CardDefinition = {
    name: "Witherbloom, the Balancer",
    manaCost: "{6}{B}{G}",
    colors: ["B", "G"],
    types: ["Legendary", "Creature"],
    subtypes: ["Elder", "Dragon"],
    power: "5",
    toughness: "5",
    keywords: ["Flying", "Deathtouch"],
    oracleText: "Affinity for creatures (This spell costs {1} less to cast for each creature you control.)\nFlying, deathtouch\nInstant and sorcery spells you cast have affinity for creatures.",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.CostReduction,
                    targetMapping: TargetMapping.Self,
                    amount: DynamicAmount.CreaturesYouControl
                }
            ]
        },
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.CostReduction,
                    targetMapping: TargetMapping.Controller,
                    amount: DynamicAmount.CreaturesYouControl,
                    restrictions: ["InstantOrSorcery"]
                }
            ]
        }
    ]
};
