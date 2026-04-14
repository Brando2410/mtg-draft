import { AbilityType, CardDefinition, EffectType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const WitherbloomtheBalancer: CardDefinition = {
    "name": "Witherbloom, the Balancer",
    "manaCost": "{6}{B}{G}",
    "colors": [
        "B",
        "G"
    ],
    "types": [
        "Legendary",
        "Creature"
    ],
    "subtypes": [
        "Elder",
        "Dragon"
    ],
    "oracleText": "Affinity for creatures (This spell costs {1} less to cast for each creature you control.)\nFlying, deathtouch\nInstant and sorcery spells you cast have affinity for creatures.",
    "abilities": [
        {
            id: "witherbloom_balancer_affinity_self",
            type: AbilityType.Static,
            oracleText: "Affinity for creatures",
            effects: [
                {
                    type: EffectType.CostReduction,
                    targetMapping: TargetMapping.Self,
                    amount: DynamicAmount.CreaturesYouControl
                }
            ]
        },
        {
            id: "witherbloom_balancer_affinity_others",
            type: AbilityType.Static,
            oracleText: "Instant and sorcery spells you cast have affinity for creatures.",
            effects: [
                {
                    type: EffectType.CostReduction,
                    targetMapping: TargetMapping.Controller,
                    amount: DynamicAmount.CreaturesYouControl,
                    restrictions: ["Instant", "Sorcery"]
                }
            ]
        }
    ],
    "keywords": ["Flying", "Deathtouch"],
    "power": "5",
    "toughness": "5"
};
