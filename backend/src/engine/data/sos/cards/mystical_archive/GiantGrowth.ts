import { AbilityType, CardDefinition, EffectType, TargetType, DurationType } from '@shared/engine_types';

export const GiantGrowth: CardDefinition = {
    name: "Giant Growth",
    manaCost: "{G}",
    scryfall_id: "62652aa9-57e7-42a7-8f2f-62e9a6aefb16",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/6/2/62652aa9-57e7-42a7-8f2f-62e9a6aefb16.jpg?1775936747",
    colors: ["G"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Target creature gets +3/+3 until end of turn.",
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
                    power: 3,
                    toughness: 3,
                    duration: { type: DurationType.UntilEndOfTurn }
                }
            ]
        }
    ]
};
