import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const KeenGlidemaster: Record<string, ImplementableCard> = {
    "Keen Glidemaster": {
        name: "Keen Glidemaster",
        manaCost: "{1}{U}",
        oracleText: "{2}{U}: Target creature gains flying until end of turn.",
        colors: ["blue"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Human", "Soldier"],
        power: "2",
        toughness: "1",
        keywords: [],
        abilities: [
            {
                id: "keen_glidemaster_active",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{2}{U}' }],
                targetDefinition: {
                    type: TargetType.Permanent,
                    count: 1,
                    minCount: 1,
                    restrictions: ["creature"]
                },
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    duration: 'UNTIL_END_OF_TURN',
                    abilitiesToAdd: ['Flying'],
                    targetMapping: 'TARGET_1'
                }],
                oracleText: "{2}{U}: Target creature gains flying until end of turn."
            }
        ]
    }
};
