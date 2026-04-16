import { AbilityType, ZoneRequirement, CardDefinition, EffectType, TriggerEvent, DurationType, TargetMapping, TargetType } from '@shared/engine_types';

export const BonePitBrute: CardDefinition = {

    name: "Bone Pit Brute",
    manaCost: "{4}{R}{R}",
    oracleText: "Menace (This creature can't be blocked except by two or more creatures.)\nWhen this creature enters, target creature gets +4/+0 until end of turn.",
    colors: ["R"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Cyclops"],
    power: "4",
    toughness: "5",
    keywords: ["Menace"],
    abilities: [
        {
            id: "bone_pit_brute_etb",
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            activeZone: ZoneRequirement.Battlefield,
            condition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
            targetDefinition: { type: TargetType.Creature, count: 1 },
            effects: [{ type: EffectType.ApplyContinuousEffect, powerModifier: 4, toughnessModifier: 0, duration: DurationType.UntilEndOfTurn, layer: 7, targetMapping: TargetMapping.Target1 }]
        }
    ]

};


