import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, Zone } from '@shared/engine_types';


export const IgneousCur: CardDefinition = {
    name: "Igneous Cur",
    manaCost: "{1}{R}",
    oracleText: "{1}{R}: This creature gets +2/+0 until end of turn.",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Elemental", "Dog"],
    power: "1",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [{ type: CostType.Mana, value: '{1}{R}' }],

            effects: [{ 
                type: EffectType.ApplyContinuousEffect, 
                powerModifier: 2, 
                duration: { type: DurationType.UntilEndOfTurn }, 
                targetMapping: TargetMapping.Self 
            }]
        }
    ]
};


