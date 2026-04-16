import { AbilityType, ZoneRequirement, CardDefinition, EffectType, TriggerEvent, DurationType, TargetMapping } from '@shared/engine_types';

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
            id: "bolt_hound_attack_trigger",
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.StartOfCombat,
            activeZone: ZoneRequirement.Battlefield,
            condition: (state: any, event: any, source: any) => {
                return event.data?.object?.id === source.sourceId;
            },
            effects: [{ type: EffectType.ApplyContinuousEffect, powerModifier: 1, toughnessModifier: 0, duration: DurationType.UntilEndOfTurn, layer: 7, targetMapping: TargetMapping.OtherCreaturesYouControl }]
        }
    ]

};


