import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const ChargingStrifeknight: CardDefinition = {
    "name": "Charging Strifeknight",
    "manaCost": "{2}{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Spirit",
        "Knight"
    ],
    "keywords": ["Haste"],
    "oracleText": "Haste\n{T}, Discard a card: Draw a card.",
    "abilities": [
        {
            type: AbilityType.Activated,
            costs: [
                { type: 'Tap' }
            ],
            effects: [
                { type: EffectType.DiscardCards, amount: 1, targetMapping: TargetMapping.Controller },
                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        }
    ],
    "power": "3",
    "toughness": "3"
};


