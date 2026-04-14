import { CardDefinition, AbilityType, EffectType, TriggerEvent, TargetMapping } from '@shared/engine_types';

export const AdventurousEaterHaveaBite: CardDefinition = {
    "name": "Adventurous Eater // Have a Bite",
    "manaCost": "{2}{B} // {B}",
    "colors": [
        "B"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Human",
        "Warlock"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "3",
    "toughness": "2",
    "faces": [
        {
            "name": "Adventurous Eater",
            "manaCost": "{2}{B}",
            "colors": ["B"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Human",
                "Warlock"
            ],
            "oracleText": "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "abilities": [
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
                    effects: [{ type: 'Prepare', targetMapping: TargetMapping.Self }]
                }
            ],
            "power": "3",
            "toughness": "2"
        },
        {
            "name": "Have a Bite",
            "manaCost": "{B}",
            "colors": ["B"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Put a +1/+1 counter on target creature. You gain 1 life.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    targetDefinition: { type: 'Creature' },
                    effects: [
                        { type: EffectType.AddCounters, amount: 1, value: 'p1p1', targetMapping: TargetMapping.Target1 },
                        { type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }
                    ]
                }
            ]
        }
    ]
};


