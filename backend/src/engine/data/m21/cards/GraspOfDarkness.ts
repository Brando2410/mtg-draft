import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const GraspOfDarkness: CardDefinition = {
    name: "Grasp of Darkness",
    manaCost: "{B}{B}",
    scryfall_id: "77cd2814-57c7-44a8-9533-03f4c5eb5924",
    image_url: "https://cards.scryfall.io/normal/front/7/7/77cd2814-57c7-44a8-9533-03f4c5eb5924.jpg?1594736139",
    oracleText: "Target creature gets -4/-4 until end of turn.",
    colors: ["B"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.Creature, count: 1 },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: -4,
                    toughnessModifier: -4,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
