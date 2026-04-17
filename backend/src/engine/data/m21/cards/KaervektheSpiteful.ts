import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const KaervektheSpiteful: CardDefinition = {
    name: "Kaervek, the Spiteful",
    manaCost: "{2}{B}{B}",
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
