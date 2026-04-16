import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const BasriDevotedPaladin: CardDefinition = {

    name: "Basri, Devoted Paladin",
    manaCost: "{4}{W}{W}",
    oracleText: "+1: Put a +1/+1 counter on up to one target creature. It gains vigilance until end of turn.\n−1: Whenever a creature attacks this turn, put a +1/+1 counter on it.\n−6: Creatures you control get +2/+2 and gain flying until end of turn.",
    colors: ["W"],
    supertypes: ["Legendary"],
    types: ["Planeswalker"],
    subtypes: ["Basri"],
    keywords: [],
    loyalty: "4",
    abilities: [
        {
            id: "basri_devoted_plus_1",
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [{ type: 'Loyalty', value: '+1' }],
            targetDefinition: { type: TargetType.Creature, count: 1, minCount: 0, optional: true },
            effects: [
                { type: EffectType.AddCounters, amount: 1, counterType: 'p1p1', targetMapping: TargetMapping.Target1 },
                { type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Vigilance'], layer: 6, targetMapping: TargetMapping.Target1 }
            ]
        },
        {
            id: "basri_devoted_minus_1",
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [{ type: 'Loyalty', value: '-1' }],
            effects: [
                {
                    type: 'AddTriggeredAbility', //?? valid
                    eventMatch: TriggerEvent.Attack,
                    duration: { type: DurationType.UntilEndOfTurn },
                    effects: [{ type: EffectType.AddCounters, targetMapping: TargetMapping.EventTarget, counterType: 'p1p1', amount: 1 }]
                }
            ]
        },
        {
            id: "basri_devoted_minus_6",
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [{ type: 'Loyalty', value: '-6' }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 2,
                    toughnessModifier: 2,
                    abilitiesToAdd: ['Flying'],
                    duration: { type: DurationType.UntilEndOfTurn },
                    layer: 6,
                    targetMapping: TargetMapping.AllCreaturesYouControl
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 2,
                    toughnessModifier: 2,
                    duration: { type: DurationType.UntilEndOfTurn },
                    layer: 7,
                    targetMapping: TargetMapping.AllCreaturesYouControl
                }
            ]
        }
    ]
};


