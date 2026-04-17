import { AbilityType, CardDefinition, EffectType, TargetMapping } from "@shared/engine_types";

export const PredatoryWurm: CardDefinition = {

    name: "Predatory Wurm",
    manaCost: "{3}{G}",
    scryfall_id: "4073cbc6-11de-4d4a-bcd7-792f9b7c5219",
    image_url: "https://cards.scryfall.io/normal/front/4/0/4073cbc6-11de-4d4a-bcd7-792f9b7c5219.jpg?1596250202",
    oracleText: "Vigilance\nPredatory Wurm gets +2/+2 as long as you control a Garruk planeswalker.",
    colors: ["G"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Wurm"],
    power: "4",
    toughness: "4",
    keywords: ["Vigilance"],
    abilities: [
        {
            type: AbilityType.Static,
            condition: 'HAS_PERMANENT:Planeswalker,Garruk',
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                layer: 7,
                powerModifier: 2,
                toughnessModifier: 2,
                targetMapping: TargetMapping.Self
            }]
        }
    ]
};

