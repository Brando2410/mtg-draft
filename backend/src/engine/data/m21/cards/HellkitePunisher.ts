import { AbilityType, Zone, CardDefinition, EffectType, TargetMapping, CostType, DurationType } from "@shared/engine_types";

export const HellkitePunisher: CardDefinition = {
    name: "Hellkite Punisher",
    manaCost: "{5}{R}{R}",
    oracleText: "Flying\n{R}: This creature gets +1/+0 until end of turn.",
    colors: ["R"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Dragon"],
    power: "6",
    toughness: "6",
    keywords: ["Flying"],
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{R}' }],
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                powerModifier: 1,
                layer: 7,
                targetMapping: TargetMapping.Self
            }],
        }
    ]
};

