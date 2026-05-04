import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from "@shared/engine_types";

export const DireFleetWarmonger: CardDefinition = {
    name: "Dire Fleet Warmonger",
    manaCost: "{1}{B}{R}",
    scryfall_id: "1fa781df-859f-4346-9424-b3713b17e1f6",
    image_url: "https://cards.scryfall.io/normal/front/1/f/1fa781df-859f-4346-9424-b3713b17e1f6.jpg?1594737366",
    oracleText: "At the beginning of combat on your turn, you may sacrifice another creature. If you do, this creature gets +2/+2 and gains trample until end of turn. (It can deal excess combat damage to the player or planeswalker it's attacking.)",
    colors: ["B", "R"],
    types: ["Creature"],
    subtypes: ["Orc", "Pirate"],
    power: "3",
    toughness: "3",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.BeginningOfCombatStep,
            condition: ConditionType.IsYourTurn,
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
                                    targetDefinitions: [{
                                        type: TargetType.Creature,
                                        count: 1,
                                        restrictions: [
                                            Restriction.Other,
                                            Restriction.YouControl
                                        ]
                                    }]
                                },
                                {
                                    type: EffectType.ApplyContinuousEffect,
                                    powerModifier: 2,
                                    toughnessModifier: 2,
                                    abilitiesToAdd: ["Trample"],
                                    duration: {
                                        type: DurationType.UntilEndOfTurn
                                    },
                                    targetMapping: TargetMapping.Self
                                }
                            ]
                        }
                    ]
                }
            ],
        }
    ]
};
