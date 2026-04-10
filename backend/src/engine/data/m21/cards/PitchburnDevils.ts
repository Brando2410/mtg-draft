import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const PitchburnDevils: Record<string, ImplementableCard> = {
    "Pitchburn Devils": {
        name: "Pitchburn Devils",
        manaCost: "{4}{R}",
        oracleText: "When Pitchburn Devils dies, it deals 3 damage to any target.",
        colors: ["red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Devil"],
        power: "3",
        toughness: "3",
        keywords: [],
        abilities: [
            {
                id: "pitchburn_devils_death",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                triggerEvent: "ON_DEATH",
                targetDefinition: {
                    type: TargetType.AnyTarget,
                    count: 1
                },
                effects: [
                    {
                        type: EffectType.DealDamage,
                        amount: 3,
                        targetMapping: "TARGET_1"
                    }
                ]
            }
        ]
    }
};
