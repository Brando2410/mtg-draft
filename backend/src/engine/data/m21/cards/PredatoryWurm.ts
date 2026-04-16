import { AbilityType, Zone, CardDefinition, EffectType, TargetMapping } from "@shared/engine_types";

export const PredatoryWurm: CardDefinition = {

    name: "Predatory Wurm",
    manaCost: "{3}{G}",
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
            activeZone: Zone.Battlefield,
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

