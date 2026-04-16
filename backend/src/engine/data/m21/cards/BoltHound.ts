import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const BoltHound: CardDefinition = {

    name: "Bolt Hound",
    manaCost: "{2}{R}",
    oracleText: "Haste (This creature can attack and {T} as soon as it comes under your control.)\nWhenever this creature attacks, other creatures you control get +1/+0 until end of turn.",
    colors: ["R"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Elemental", "Dog"],
    power: "2",
    toughness: "2",
    keywords: ["Haste"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.StartOfCombat,
            effects: [{ type: EffectType.ApplyContinuousEffect, powerModifier: 1, toughnessModifier: 0, duration: { type: DurationType.UntilEndOfTurn }, layer: 7, targetMapping: TargetMapping.OtherCreaturesYouControl }]
        }
    ]

};




