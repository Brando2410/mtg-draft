import { CardDefinition, AbilityType, Zone, EffectType, TargetMapping, DurationType } from "@shared/engine_types";

export const PestilentHaze: CardDefinition = {
    name: "Pestilent Haze",
    manaCost: "{1}{B}{B}",
    oracleText: "Choose one —\n• All creatures get -2/-2 until end of turn.\n• Remove two loyalty counters from each planeswalker.",
    colors: ["B"],
    types: ["Sorcery"],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.Choice,
                    choices: [
                        {
                            label: "All creatures get -2/-2",
                            effects: [{
                                type: EffectType.ApplyContinuousEffect,
                                duration: { type: DurationType.UntilEndOfTurn },
                                layer: 7,
                                powerModifier: -2,
                                toughnessModifier: -2,
                                targetMapping: TargetMapping.AllCreatures
                            }]
                        },
                        {
                            label: "Remove 2 loyalty from each planeswalker",
                            effects: [{
                                type: EffectType.AddCounters,
                                counterType: 'loyalty',
                                amount: -2,
                                targetMapping: TargetMapping.AllPlaneswalkers
                            }]
                        }
                    ]
                }
            ]
        }
    ]
};

