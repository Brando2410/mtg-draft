import { AbilityType, DurationType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType, Restriction } from "@shared/engine_types";

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
                    type: TargetType.Creature,
                    count: 1
                },
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    duration: DurationType.UntilEndOfTurn,
                    abilitiesToAdd: ['Flying'],
                    targetMapping: 'TARGET_1'
                }],
                oracleText: "{2}{U}: Target creature gains flying until end of turn."
            }
        ]
    }
};
