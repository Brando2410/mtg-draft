import { AbilityType, CardDefinition, EffectType, TargetType, DurationType, TargetMapping } from '@shared/engine_types';

export const GraspOfDarkness: CardDefinition = {

    name: "Grasp of Darkness",
    manaCost: "{B}{B}",
    oracleText: "Target creature gets -4/-4 until end of turn.",
    colors: ["B"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.Creature, count: 1 },
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                powerModifier: -4,
                toughnessModifier: -4,
                duration: { type: DurationType.UntilEndOfTurn },
                layer: 7,
                targetMapping: TargetMapping.Target1
            }]
        }
    ]

};


