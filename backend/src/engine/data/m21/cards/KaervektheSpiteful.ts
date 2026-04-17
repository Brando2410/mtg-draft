import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const KaervektheSpiteful: CardDefinition = {
    name: "Kaervek, the Spiteful",
    manaCost: "{2}{B}{B}",
    scryfall_id: "b0fd1009-cd3d-4b53-b9f1-dbc47e8708ab",
    image_url: "https://cards.scryfall.io/normal/front/b/0/b0fd1009-cd3d-4b53-b9f1-dbc47e8708ab.jpg?1594736203",
    oracleText: "Other creatures get -1/-1.",
    colors: ["B"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Human", "Warlock"],
    power: "3",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                layer: 7,
                powerModifier: -1,
                toughnessModifier: -1,
                targetMapping: TargetMapping.AllOtherCreatures
            }]
        }
    ]
};
