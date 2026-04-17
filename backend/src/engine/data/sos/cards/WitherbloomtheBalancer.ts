import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const WitherbloomtheBalancer: CardDefinition = {
    name: "Witherbloom, the Balancer",
    manaCost: "{6}{B}{G}",
    colors: [
        "B",
        "G"
    ],
    types: [
        "Legendary",
        "Creature"
    ],
    subtypes: [
        "Elder",
        "Dragon"
    ],
    keywords: ["Flying", "Deathtouch"],
    oracleText: "Affinity for creatures (This spell costs {1} less to cast for each creature you control.)\nFlying, deathtouch\nInstant and sorcery spells you cast have affinity for creatures.",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.CostReduction,
                    targetMapping: TargetType.Self,
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
                    restrictions: [
                { type: 'Type', value: 'InstantOrSorcery' }
            ]
                }
            ]
        }
    ],

    power: "5",
    toughness: "5"
};
