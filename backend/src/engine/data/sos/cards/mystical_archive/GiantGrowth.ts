import { AbilityType, CardDefinition, DurationType, EffectType, TargetType } from '@shared/engine_types';

export const GiantGrowth: CardDefinition = {
    name: "Giant Growth",
    manaCost: "{G}",
    colors: ["G"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Target creature gets +3/+3 until end of turn.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1
            }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 3,
                    toughnessModifier: 3,
                    duration: { type: DurationType.UntilEndOfTurn }
                }
            ]
        }
    ],
    scryfall_id: "62652aa9-57e7-42a7-8f2f-62e9a6aefb16",
    image_url: "https://cards.scryfall.io/normal/front/6/2/62652aa9-57e7-42a7-8f2f-62e9a6aefb16.jpg?1775936747",
    rarity: "uncommon"
};

