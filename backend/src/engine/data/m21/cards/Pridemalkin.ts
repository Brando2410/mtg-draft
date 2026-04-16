import { AbilityType, ZoneRequirement, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent } from "@shared/engine_types";

export const Pridemalkin: CardDefinition = {

    name: "Pridemalkin",
    manaCost: "{2}{G}",
    oracleText: "When this creature enters, put a +1/+1 counter on target creature you control. Each creature you control with a +1/+1 counter on it has trample.",
    colors: ["G"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Cat"],
    power: "2",
    toughness: "1",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: { type: TargetType.Creature, count: 1, restrictions: ['YouControl'] },
            effects: [{
                type: EffectType.AddCounters,
                counterType: 'p1p1',
                amount: 1,
                targetMapping: TargetMapping.Target1
            }]
        },
        {
            type: AbilityType.Static,
            activeZone: ZoneRequirement.Battlefield,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                layer: 6,
                abilitiesToAdd: ['Trample'],
                targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                restrictions: ['Creature', 'HasCounter_+1/+1']
            }]
        }
    ]
};


