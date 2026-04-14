import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const JadziStewardofFateOraclesGift: CardDefinition = {
    "name": "Jadzi, Steward of Fate // Oracle's Gift",
    "manaCost": "{2}{U} // {X}{X}{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Legendary",
        "Creature",
        "Sorcery"
    ],
    "subtypes": [
        "Human",
        "Wizard"
    ],
    "oracleText": "Jadzi enters prepared.\nWhen Jadzi enters, draw two cards, then discard two cards.\nOracle's Gift: Create X 0/0 green and blue Fractal creature tokens, then put X +1/+1 counters on each Fractal you control.",
    "abilities": [],
    "power": "2",
    "toughness": "4",
    "faces": [
        {
            "name": "Jadzi, Steward of Fate",
            "manaCost": "{2}{U}",
            "colors": ["U"],
            "types": [
                "Legendary",
                "Creature"
            ],
            "subtypes": [
                "Human",
                "Wizard"
            ],
            "oracleText": "Jadzi enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)\nWhen Jadzi enters, draw two cards, then discard two cards.",
            "entersPrepared": true,
            "abilities": [
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
                    effects: [
                        { type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Controller },
                        { type: EffectType.DiscardCards, amount: 2, targetMapping: TargetMapping.Controller }
                    ]
                }
            ],
            "power": "2",
            "toughness": "4"
        },
        {
            "name": "Oracle's Gift",
            "manaCost": "{X}{X}{U}",
            "colors": ["U"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Create X 0/0 green and blue Fractal creature tokens, then put X +1/+1 counters on each Fractal you control.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    effects: [
                        {
                            type: EffectType.CreateToken,
                            tokenBlueprint: "Fractal",
                            amount: "X",
                            targetMapping: TargetMapping.Controller
                        },
                        {
                            type: EffectType.AddCounters,
                            counterType: 'p1p1',
                            amount: "X",
                            targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                            restrictions: ['Fractal']
                        }
                    ]
                }
            ]
        }
    ]
};



