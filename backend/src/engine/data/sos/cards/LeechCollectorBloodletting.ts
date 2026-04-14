import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping } from '@shared/engine_types';

export const LeechCollectorBloodletting: CardDefinition = {
    "name": "Leech Collector // Bloodletting",
    "manaCost": "{1}{B} // {B}",
    "colors": [
        "B"
    ],
    "types": [
        "Creature",
        "Sorcery"
    ],
    "subtypes": [
        "Human",
        "Warlock"
    ],
    "oracleText": "Whenever you gain life for the first time each turn, Leech Collector becomes prepared.\nBloodletting: Each opponent loses 2 life.",
    "abilities": [],
    "power": "2",
    "toughness": "2",
    "faces": [
        {
            "name": "Leech Collector",
            "manaCost": "{1}{B}",
            "colors": ["B"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Human",
                "Warlock"
            ],
            "oracleText": "Whenever you gain life for the first time each turn, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "abilities": [
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.LifeGain,
                    limitPerTurn: 1,
                    triggerCondition: (state, event, trigger) => {
                        return event.playerId === trigger.controllerId;
                    },
                    effects: [{ type: EffectType.Prepare, targetMapping: TargetMapping.Self }]
                }
            ],
            "power": "2",
            "toughness": "2"
        },
        {
            "name": "Bloodletting",
            "manaCost": "{B}",
            "colors": ["B"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Each opponent loses 2 life.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    effects: [{ type: EffectType.LoseLife, amount: 2, targetMapping: "EACH_OPPONENT" }]
                }
            ]
        }
    ]
};
