import { CardDefinition, AbilityType, EffectType, TargetMapping, Zone, SelectionType, ConditionType } from '@shared/engine_types';

export const SanarUnfinishedGeniusWildIdea: CardDefinition = {
    "name": "Sanar, Unfinished Genius // Wild Idea",
    "manaCost": "{U}{R} // {3}{U}{R}",
    "colors": [
        "R",
        "U"
    ],
    "types": [
        "Legendary",
        "Creature"
    ],
    "subtypes": [
        "Goblin",
        "Sorcerer"
    ],
    "oracleText": "Sanar enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)\n{T}: Create a Treasure token. Activate only if you've cast an instant or sorcery spell this turn.\n//\nWild Idea\nSearch your library for an instant or sorcery card, reveal it, put it into your hand, then shuffle.",
    "power": "0",
    "toughness": "4",
    "entersPrepared": true,
    "faces": [
        {
            "name": "Sanar, Unfinished Genius",
            "manaCost": "{U}{R}",
            "colors": [
                "U",
                "R"
            ],
            "types": [
                "Legendary",
                "Creature"
            ],
            "subtypes": [
                "Goblin",
                "Sorcerer"
            ],
            "oracleText": "Sanar enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)\n{T}: Create a Treasure token. Activate only if you've cast an instant or sorcery spell this turn.",
            "power": "0",
            "toughness": "4",
            "entersPrepared": true,
            "abilities": [
                {
                    type: AbilityType.Activated,
                    costs: [{ type: 'Tap' }],
                    condition: ConditionType.CastInstantSorceryThisTurn,
                    effects: [
                        {
                            type: EffectType.CreateToken,
                            tokenBlueprint: {
                                name: "Treasure",
                                types: ["Artifact"],
                                subtypes: ["Treasure"],
                                colors: [],
                                oracleText: "{T}, Sacrifice this artifact: Add one mana of any color.",
                                abilities: [
                                    {
                                        type: AbilityType.Activated,
                                        isManaAbility: true,
                                        costs: [{ type: 'Tap' }, { type: 'Sacrifice', targetMapping: TargetMapping.Self }],
                                        effects: [{ type: EffectType.AddMana, value: '{ANY}' }]
                                    }
                                ]
                            }
                        }
                    ]
                }
            ]
        },
        {
            "name": "Wild Idea",
            "manaCost": "{3}{U}{R}",
            "colors": [
                "U",
                "R"
            ],
            "types": [
                "Sorcery"
            ],
            "oracleText": "Search your library for an instant or sorcery card, reveal it, put it into your hand, then shuffle.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    effects: [
                        {
                            type: EffectType.MoveToZone,
                            selectionType: SelectionType.Search,
                            sourceZones: [Zone.Library],
                            destination: Zone.Hand,
                            restrictions: [{ types: ['Instant', 'Sorcery'] }],
                            reveal: true,
                            shuffle: true,
                            amount: 1
                        }
                    ]
                }
            ]
        }
    ]
};


