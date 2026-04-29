import { CardDefinition } from '@shared/engine_types';

export const BurstLightning: CardDefinition = {
    name: "Burst Lightning",
    manaCost: "{R}",
    scryfall_id: "f98b402a-ecdb-432f-a050-65945c8c415d",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/f/9/f98b402a-ecdb-432f-a050-65945c8c415d.jpg?1775936664",
    colors: ["R"],
    types: ["Instant"],
    subtypes: [],
    keywords: ["Kicker"],
    oracleText: "Kicker {4} (You may pay an additional {4} as you cast this spell.)\nBurst Lightning deals 2 damage to any target. If this spell was kicked, it deals 4 damage instead.",
    set: "soa",
    abilities: [/*
        {
            type: AbilityType.Spell,
            kicker: { type: CostType.Mana, value: "{4}" },
            targetDefinition: {
                type: TargetType.Any,
                count: 1
            },
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 2,
                    kickedAmount: 4
                }
            ]
        }*/
    ]
};
