import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const KirolHistoryBuffPackaPunch: CardDefinition = {
    "name": "Kirol, History Buff // Pack a Punch",
    "manaCost": "{R}{W} // {1}{R}{W}",
    "colors": [
        "R",
        "W"
    ],
    "types": [
        "Legendary",
        "Creature",
        "Sorcery"
    ],
    "subtypes": [
        "Vampire",
        "Cleric"
    ],
    "oracleText": "Whenever one or more cards leave your graveyard, Kirol becomes prepared.\nPack a Punch: Mill a card. Put two +1/+1 counters on target creature. It gains trample until end of turn.",
    "abilities": [],
    "power": "2",
    "toughness": "3",
    "faces": [
        {
            "name": "Kirol, History Buff",
            "manaCost": "{R}{W}",
            "colors": ["R", "W"],
            "types": [
                "Legendary",
                "Creature"
            ],
            "subtypes": [
                "Vampire",
                "Cleric"
            ],
            "oracleText": "Whenever one or more cards leave your graveyard, Kirol becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "abilities": [
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.LeaveGraveyard,
                    condition: (state, event, trigger) => {
                        return event.playerId === trigger.controllerId;
                    },
                    effects: [{ type: EffectType.Prepare, targetMapping: TargetMapping.Self }]
                }
            ],
            "power": "2",
            "toughness": "3"
        },
        {
            "name": "Pack a Punch",
            "manaCost": "{1}{R}{W}",
            "colors": ["R", "W"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Mill a card. Put two +1/+1 counters on target creature. It gains trample until end of turn.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    targetDefinition: {
                        type: TargetType.Permanent,
                        count: 1,
                        restrictions: ["Creature"]
                    },
                    effects: [
                        { type: EffectType.Mill, amount: 1, targetMapping: TargetMapping.Controller },
                        { type: EffectType.AddCounters, counterType: 'p1p1', amount: 2, targetMapping: TargetMapping.Target1 },
                        {
                            type: EffectType.ApplyContinuousEffect,
                            abilitiesToAdd: ["Trample"],
                            duration: "UNTIL_END_OF_TURN",
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                }
            ]
        }
    ]
};



