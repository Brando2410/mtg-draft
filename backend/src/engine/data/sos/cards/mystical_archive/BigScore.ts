import { AbilityType, CardDefinition, CostType, EffectType } from '@shared/engine_types';

export const BigScore: CardDefinition = {
    name: "Big Score",
    manaCost: "{3}{R}",
    scryfall_id: "c7b698a1-dff1-413f-ba4f-0298c686999a",
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/c/7/c7b698a1-dff1-413f-ba4f-0298c686999a.jpg?1775936641",
    colors: ["R"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "As an additional cost to cast this spell, discard a card.\nDraw two cards and create two Treasure tokens. (They're artifacts with \"{T}, Sacrifice this token: Add one mana of any color.\")",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            additionalCosts: [
                {
                    type: CostType.Discard,
                    amount: 1
                }
            ],
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 2
                },
                {
                    type: EffectType.CreateToken,
                    amount: 2,
                    tokenBlueprint: {
                        name: "Treasure",
                        types: ["Artifact"],
                        subtypes: ["Treasure"],
                        abilities: [
                            {
                                type: AbilityType.Activated,
                                costs: [{ type: CostType.Tap }, { type: CostType.SacrificeSelf }],
                                effects: [{ type: EffectType.AddMana, manaType: "{ANY}" }]
                            }
                        ]
                    }
                }
            ]
        }
    ]
};
