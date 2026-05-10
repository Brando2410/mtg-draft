import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from '@shared/engine_types';
export const SeizetheSpoils: CardDefinition = {
    name: "Seize the Spoils",
    manaCost: "{2}{R}",
    colors: ["R"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "As an additional cost to cast this spell, discard a card.\nDraw two cards and create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",

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
                        image_url: "https://cards.scryfall.io/normal/front/4/3/437976e1-9f2d-4560-8451-f7615957d591.jpg?1775828483",
                        abilities: [
                            {
                                type: AbilityType.Activated,
                                id: "{T}, Sacrifice this token: Add one mana of any color.",
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
                        ]
                    }
                }
            ]
        }
    ],
    scryfall_id: "4ddf4e34-a1f9-4636-942d-0a08e9f94320",
    image_url: "https://cards.scryfall.io/normal/front/4/d/4ddf4e34-a1f9-4636-942d-0a08e9f94320.jpg?1775937868",
    rarity: "common"
};

