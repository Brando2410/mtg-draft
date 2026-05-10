import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const GraspOfDarkness: CardDefinition = {
    name: "Grasp of Darkness",
    manaCost: "{B}{B}",

    oracleText: "Target creature gets -4/-4 until end of turn.",
    colors: ["B"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{ type: TargetType.Creature, count: 1 }],
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
    ],
    scryfall_id: "7737b578-8ae3-4846-b508-93ef40f25244",
    image_url: "https://cards.scryfall.io/normal/front/7/7/7737b578-8ae3-4846-b508-93ef40f25244.jpg?1594736166",
    rarity: "common"
};

