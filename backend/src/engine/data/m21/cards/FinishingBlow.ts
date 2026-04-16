import {AbilityType, Zone, CardDefinition, EffectType, GameEvent, GameObject, TargetType} from "@shared/engine_types";

export const FinishingBlow: CardDefinition = {
        name: "Finishing Blow",
        manaCost: "{4}{B}",
        oracleText: "Destroy target creature or planeswalker.",
        colors: ["black"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: "",
        toughness: "",
        keywords: [],
        abilities: [
            {
                id: "finishing_blow_spell",
                type: AbilityType.Spell,
                activeZone: Zone.Hand,
                targetDefinition: {
                    type: TargetType.Permanent,
                    count: 1,
                    restrictions: ["creature", "planeswalker"]
                },
                effects: [
                    {
                        type: EffectType.Destroy,
                        targetMapping: "TARGET_1"
                    }
                ],
                oracleText: "Destroy target creature or planeswalker."
            }
        ]
    };

