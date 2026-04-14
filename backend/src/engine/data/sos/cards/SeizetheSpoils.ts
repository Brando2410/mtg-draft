import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const SeizetheSpoils: CardDefinition = {
    "name": "Seize the Spoils",
    "manaCost": "{2}{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "As an additional cost to cast this spell, discard a card.\nDraw two cards and create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
    "abilities": [
        {
            type: AbilityType.Spell,
            costs: [
                {
                    type: 'Discard',
                    amount: 1
                }
            ],
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Treasure',
                        colors: [],
                        types: ['Artifact', 'Token'],
                        subtypes: ['Treasure'],
                        oracleText: "{T}, Sacrifice this token: Add one mana of any color.",
                        abilities: [
                            {
                                type: AbilityType.Activated,
                                costs: [
                                    { type: 'Tap' },
                                    { type: 'SacrificeSelf' }
                                ],
                                effects: [
                                    {
                                        type: EffectType.AddMana,
                                        mana: '{ANY}'
                                    }
                                ]
                            }
                        ],
                        image_url: 'https://cards.scryfall.io/large/front/a/1/a1d9b4c2-9e19-4c8d-8153-97aeab6c55cc.jpg'
                    }
                }
            ]
        }
    ]
};


