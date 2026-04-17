import { AbilityType, CardDefinition, EffectType, TargetType, DurationType, TargetMapping } from '@shared/engine_types';

export const GraspOfDarkness: CardDefinition = {

    name: "Grasp of Darkness",
    manaCost: "{B}{B}",
    scryfall_id: "7737b578-8ae3-4846-b508-93ef40f25244",
    image_url: "https://cards.scryfall.io/normal/front/7/7/7737b578-8ae3-4846-b508-93ef40f25244.jpg?1594736166",
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


