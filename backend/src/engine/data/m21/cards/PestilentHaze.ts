import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const PestilentHaze: Record<string, ImplementableCard> = {
    "Pestilent Haze": {
        name: "Pestilent Haze",
        manaCost: "{1}{B}{B}",
        oracleText: "Choose one —\n• All creatures get -2/-2 until end of turn.\n• Remove two loyalty counters from each planeswalker.",
        colors: ["black"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        power: "",
        toughness: "",
        keywords: [],
        abilities: [
            {
                id: "pestilent_haze_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [
                    {
                        type: EffectType.Choice,
                        choices: [
                            {
                                label: "All creatures get -2/-2",
                                effects: [{
                                    type: EffectType.ApplyContinuousEffect,
                                    duration: 'UNTIL_END_OF_TURN',
                                    layer: 7,
                                    powerModifier: -2,
                                    toughnessModifier: -2,
                                    targetMapping: 'ALL_CREATURES'
                                }]
                            },
                            {
                                label: "Remove 2 loyalty from each planeswalker",
                                effects: [{
                                    type: EffectType.Log,
                                    message: "Remove loyalty counters"
                                }]
                            }
                        ]
                    }
                ]
            }
        ]
    }
};
