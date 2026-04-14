import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const EmeritusofAbundanceRegrowth: CardDefinition = {
    "name": "Emeritus of Abundance // Regrowth",
    "manaCost": "{2}{G} // {1}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Elf",
        "Druid"
    ],
    "oracleText": "Vigilance; Prepare on attack if 8+ lands // Return target card from graveyard to hand.",
    "abilities": [],
    "power": "3",
    "toughness": "4",
    "entersPrepared": true,
    "faces": [
        {
            "name": "Emeritus of Abundance",
            "manaCost": "{2}{G}",
            "colors": ["G"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Elf",
                "Druid"
            ],
            "oracleText": "Vigilance\nThis creature enters prepared.\nWhenever this creature attacks, if you control eight or more lands, this creature becomes prepared.",
            "power": "3",
            "toughness": "4",
            "keywords": ["Vigilance"],
            "entersPrepared": true,
            "abilities": [
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
                    condition: 'LAND_COUNT_GE:8',
                    effects: [
                        {
                            type: EffectType.Prepare,
                            targetMapping: TargetMapping.Self
                        }
                    ]
                }
            ]
        },
        {
            "name": "Regrowth",
            "manaCost": "{1}{G}",
            "colors": ["G"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Return target card from your graveyard to your hand.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    targetDefinition: {
                        type: 'Card',
                        zone: Zone.Graveyard,
                        count: 1
                    },
                    effects: [
                        {
                            type: EffectType.MoveToZone,
                            zone: Zone.Hand,
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                }
            ]
        }
    ]
};
