import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping } from '@shared/engine_types';

export const SheoldredsEdict: CardDefinition = {
    name: "Sheoldred's Edict",
    manaCost: "{1}{B}",
    colors: ["B"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Choose one —\n• Each opponent sacrifices a nontoken creature of their choice.\n• Each opponent sacrifices a creature token of their choice.\n• Each opponent sacrifices a planeswalker of their choice.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            minChoices: 1,
            maxChoices: 1,
            modes: [
                {
                    label: "Each opponent sacrifices a nontoken creature",
                    effects: [
                        {
                            type: EffectType.Sacrifice,
                            targetMapping: TargetMapping.EachOpponent,
                            amount: 1,
                            restrictions: [Restriction.Creature, Restriction.NonToken]
                        }
                    ]
                },
                {
                    label: "Each opponent sacrifices a creature token",
                    effects: [
                        {
                            type: EffectType.Sacrifice,
                            targetMapping: TargetMapping.EachOpponent,
                            amount: 1,
                            restrictions: [Restriction.Creature, Restriction.Token]
                        }
                    ]
                },
                {
                    label: "Each opponent sacrifices a planeswalker",
                    effects: [
                        {
                            type: EffectType.Sacrifice,
                            targetMapping: TargetMapping.EachOpponent,
                            amount: 1,
                            restrictions: [Restriction.Planeswalker]
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "dca66a1b-0acd-4b79-b5fe-16f2930f9c1b",
    image_url: "https://cards.scryfall.io/normal/front/d/c/dca66a1b-0acd-4b79-b5fe-16f2930f9c1b.jpg?1775936597",
    rarity: "rare"
};
