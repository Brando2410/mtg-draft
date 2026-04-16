import { AbilityType, ZoneRequirement, EffectType, TargetType, DurationType, TargetMapping, CardDefinition } from "@shared/engine_types";

export const FrostBreath: CardDefinition = {

    name: "Frost Breath",
    manaCost: "{2}{U}",
    oracleText: "Tap up to two target creatures. Those creatures don't untap during their controller's next untap step.",
    colors: ["U"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            id: "frost_breath_spell",
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Hand,
            targetDefinition: {
                type: TargetType.Creature,
                count: 2,
                minCount: 0
            },
            effects: [
                {
                    type: EffectType.Tap,
                    targetMapping: TargetMapping.TargetAll
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    abilitiesToAdd: ["CannotUntap"],
                    duration: {
                        type: DurationType.UntilNextUntapStep
                    },
                    targetMapping: TargetMapping.TargetAll
                }
            ],
        }
    ]

};
