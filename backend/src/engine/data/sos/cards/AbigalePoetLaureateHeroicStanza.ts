import { CardDefinition, AbilityType, EffectType, TriggerEvent, TargetMapping } from '@shared/engine_types';

export const AbigalePoetLaureateHeroicStanza: CardDefinition = {
    "name": "Abigale, Poet Laureate // Heroic Stanza",
    "manaCost": "{1}{W}{B} // {1}{W/B}",
    "colors": [
        "B",
        "W"
    ],
    "types": [
        "Legendary",
        "Creature"
    ],
    "subtypes": [
        "Bird",
        "Bard"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "2",
    "toughness": "3",
    "faces": [
        {
            "name": "Abigale, Poet Laureate",
            "manaCost": "{1}{W}{B}",
            "colors": ["B", "W"],
            "types": [
                "Legendary",
                "Creature"
            ],
            "subtypes": [
                "Bird",
                "Bard"
            ],
            "keywords": ["Flying"],
            "oracleText": "Flying\nWhenever you cast a creature spell, Abigale becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "abilities": [
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastSpell,
                    triggerCondition: 'SPELL_IS_CREATURE',
                    effects: [{ type: 'Prepare', targetMapping: TargetMapping.Self }]
                }
            ],
            "power": "2",
            "toughness": "3"
        },
        {
            "name": "Heroic Stanza",
            "manaCost": "{1}{W/B}",
            "colors": ["B", "W"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Put a +1/+1 counter on target creature.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    targetDefinition: { type: 'Creature' },
                    effects: [
                        {
                            type: EffectType.AddCounters,
                            amount: 1,
                            value: '+1/+1',
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                }
            ]
        }
    ]
};
