import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const CheerfulOsteomancerRaiseDead: CardDefinition = {
    "name": "Cheerful Osteomancer // Raise Dead",
    "manaCost": "{3}{B} // {B}",
    "colors": [
        "B"
    ],
    "types": [
        "Creature",
        "Sorcery"
    ],
    "subtypes": [
        "Orc",
        "Warlock"
    ],
    "oracleText": "Cheerful Osteomancer (Creature): This creature enters prepared.\nRaise Dead (Sorcery): Return target creature card from your graveyard to your hand.",
    "abilities": [],
    "power": "4",
    "toughness": "2",
    "entersPrepared": true,
    "faces": [
        {
            "name": "Cheerful Osteomancer",
            "manaCost": "{3}{B}",
            "colors": ["B"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Orc",
                "Warlock"
            ],
            "oracleText": "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "abilities": [],
            "power": "4",
            "toughness": "2",
            "entersPrepared": true
        },
        {
            "name": "Raise Dead",
            "manaCost": "{B}",
            "colors": ["B"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Return target creature card from your graveyard to your hand.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    targetDefinition: { type: 'CardInGraveyard', count: 1, restrictions: ['Creature', 'Yours'] },
                    effects: [{ type: EffectType.ReturnToHand, targetMapping: TargetMapping.Target1 }]
                }
            ]
        }
    ]
};
