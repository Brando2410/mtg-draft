import { AbilityType, ZoneRequirement, ImplementableCard } from '@shared/engine_types';

export const GraspOfDarkness: Record<string, ImplementableCard> = {
    "Grasp of Darkness": {
        name: "Grasp of Darkness",
        manaCost: "{B}{B}",
        oracleText: "Target creature gets -4/-4 until end of turn.",
        colors: ["black"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        keywords: [],
        abilities: [
            {
                id: "grasp_darkness_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [{ type: 'ApplyContinuousEffect', powerModifier: -4, toughnessModifier: -4, duration: 'UNTIL_END_OF_TURN', layer: 7, targetMapping: 'TARGET_1' }]
            }
        ]
    },
};
