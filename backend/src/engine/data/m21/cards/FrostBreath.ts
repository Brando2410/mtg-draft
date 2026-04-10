import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType, DurationType } from "@shared/engine_types";

export const FrostBreath: Record<string, ImplementableCard> = {
    "Frost Breath": {
        name: "Frost Breath",
        manaCost: "{2}{U}",
        oracleText: "Tap up to two target creatures. Those creatures don't untap during their controller's next untap step.",
        colors: ["blue"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: "",
        toughness: "",
        keywords: [],
        abilities: [
            {
                id: "frost_breath_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Hand,
                targetDefinition: {
                    type: TargetType.Permanent,
                    count: 2,
                    minCount: 0,
                    restrictions: ["creature"]
                },
                effects: [
                    {
                        type: EffectType.Tapped,
                        targetMapping: "TARGET_ALL"
                    },
                    {
                        type: EffectType.ApplyContinuousEffect,
                        abilitiesToAdd: ["CannotUntap"],
                        duration: {
                            type: DurationType.UntilNextUntapStep
                        },
                        targetMapping: "TARGET_ALL"
                    }
                ],
                oracleText: "Tap up to two target creatures. Those creatures don't untap during their controller's next untap step."
            }
        ]
    }
};
