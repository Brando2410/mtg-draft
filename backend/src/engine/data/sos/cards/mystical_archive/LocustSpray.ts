import { AbilityType, CardDefinition, EffectType, TargetType, DurationType, CostType, TargetMapping } from '@shared/engine_types';

export const LocustSpray: CardDefinition = {
    name: "Locust Spray",
    manaCost: "{B}",
    scryfall_id: "b221e1e9-7b14-4444-ac1c-3d5174c711e9",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/b/2/b221e1e9-7b14-4444-ac1c-3d5174c711e9.jpg?1775936590",
    colors: ["B"],
    types: ["Instant"],
    subtypes: [],
    keywords: ["Cycling"],
    oracleText: "Target creature gets -1/-1 until end of turn.\nCycling {B} ({B}, Discard this card: Draw a card.)",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    power: -1,
                    toughness: -1,
                    duration: { type: DurationType.UntilEndOfTurn }
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: "{B}" },
                { type: CostType.Discard, amount: 1 }
            ],
            effects: [
                { type: EffectType.DrawCards, amount: 1 }
            ]
        }
    ]
};
