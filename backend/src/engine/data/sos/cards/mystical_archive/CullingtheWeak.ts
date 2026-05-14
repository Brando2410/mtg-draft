import { AbilityType, CardDefinition, CostType, EffectType, Restriction } from '@shared/engine_types';

export const CullingtheWeak: CardDefinition = {
    name: "Culling the Weak",
    manaCost: "{B}",


    colors: ["B"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "As an additional cost to cast this spell, sacrifice a creature.\nAdd {B}{B}{B}{B}.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            additionalCosts: [
                {
                    type: CostType.Sacrifice,
                    restrictions: [Restriction.Creature],
                    amount: 1
                }
            ],
            effects: [
                {
                    type: EffectType.AddMana,
                    manaType: "{B}{B}{B}{B}"
                }
            ]
        }
    ],
    scryfall_id: "6c84aa77-bcb0-4a59-b94c-8cb9cbf6af76",
    image_url: "https://cards.scryfall.io/normal/front/6/c/6c84aa77-bcb0-4a59-b94c-8cb9cbf6af76.jpg?1775936562",
    rarity: "rare"
};

