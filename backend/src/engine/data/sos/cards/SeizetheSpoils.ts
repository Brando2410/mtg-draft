import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from '@shared/engine_types';
export const SeizetheSpoils: CardDefinition = {
    name: "Seize the Spoils",
    manaCost: "{2}{R}",
    colors: [
        "R"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "As an additional cost to cast this spell, discard a card.\nDraw two cards and create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
    image_url: 'https://cards.scryfall.io/large/front/a/1/a1d9b4c2-9e19-4c8d-8153-97aeab6c55cc.jpg',

    abilities: [
        {
            type: AbilityType.Spell,
            costs: [
                {
                    type: CostType.Discard,
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
                        name: "Treasure",
                        colors: [],
                        types: ["Artifact", "Token"],
                        subtypes: ["Treasure"],
                        oracleText: "{T}, Sacrifice this token: Add one mana of any color.",
                        image_url: "https://cards.scryfall.io/png/front/1/a/1a2d027f-8996-4761-a776-47cd428f6779.png?1641306162",
                        abilities: [
                            {
                                type: AbilityType.Activated,
                                id: 'Treasure_Mana_Ability',
                                costs: [
                                    { type: CostType.Tap },
                                    { type: CostType.SacrificeSelf }
                                ],
                                effects: [
                                    {
                                        type: EffectType.AddMana,
                                        manaType: '{ANY}'
                                    }
                                ],
                                isManaAbility: true
                            }
                        ],
                    }
                }
            ]
        }
    ]
};

