import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const GloriousAnthem: CardDefinition = {
    name: "Glorious Anthem",
    manaCost: "{1}{W}{W}",
    scryfall_id: "17d154d3-7ae5-43ff-9978-d974285e2c89",
    image_url: "https://cards.scryfall.io/normal/front/1/7/17d154d3-7ae5-43ff-9978-d974285e2c89.jpg?1594734982",
    oracleText: "Creatures you control get +1/+1.",
    colors: ["W"],
    supertypes: [],
    types: ["Enchantment"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                targetMapping: TargetMapping.AllCreaturesYouControl,
                powerModifier: 1,
                toughnessModifier: 1,
                layer: 7,
            }]
        }
    ]
};


