import { AbilityType, Zone, CardDefinition, Zone, EffectType, GameEvent, GameObject, TargetType, DurationType } from "@shared/engine_types";

export const DireFleetWarmonger: CardDefinition = {
        name: "Dire Fleet Warmonger",
        manaCost: "{1}{B}{R}",
        oracleText: "At the beginning of combat on your turn, you may sacrifice another creature. If you do, this creature gets +2/+2 and gains trample until end of turn. (It can deal excess combat damage to the player or planeswalker it's attacking.)",
        colors: ["black", "red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Orc", "Pirate"],
        power: "3",
        toughness: "3",
        keywords: [],
        abilities: [
            {
                id: "dire_fleet_warmonger_trigger",
                type: AbilityType.Triggered,
                activeZone: Zone.Battlefield,
                    eventMatch: "ON_BEGINNING_OF_COMBAT_STEP",
                condition: (state: any, event: any, source: any) => state.activePlayerId === source.controllerId,
                effects: [
                    {
                        type: EffectType.Choice,
                        optional: true,
                        label: "Sacrifice another creature to power up Dire Fleet Warmonger?",
                        choices: [
                            {
                                label: "Sacrifice another creature",
                                effects: [
                                    {
                                        type: EffectType.Sacrifice,
                                        targetDefinition: {
                                            type: TargetType.Permanent,
                                            count: 1,
                                            restrictions: ["creature", "other", "yours"]
                                        },
                                        targetMapping: "CONTROLLER"
                                    },
                                    {
                                        type: EffectType.ApplyContinuousEffect,
                                        powerModifier: 2,
                                        toughnessModifier: 2,
                                        abilitiesToAdd: ["Trample"],
                                        duration: {
                                            type: DurationType.UntilEndOfTurn
                                        },
                                        targetMapping: "SELF"
                                    }
                                ]
                            }
                        ]
                    }
                ],
                oracleText: "At the beginning of combat on your turn, you may sacrifice another creature. If you do, Dire Fleet Warmonger gets +2/+2 and gains trample until end of turn."
            }
        ]
    };



