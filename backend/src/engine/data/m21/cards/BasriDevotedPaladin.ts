import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const BasriDevotedPaladin: CardDefinition = {
    name: "Basri, Devoted Paladin",
    manaCost: "{4}{W}{W}",

    oracleText: "+1: Put a +1/+1 counter on up to one target creature. It gains vigilance until end of turn.\n−1: Whenever a creature attacks this turn, put a +1/+1 counter on it.\n−6: Creatures you control get +2/+2 and gain flying until end of turn.",
    colors: ["W"],
    supertypes: ["Legendary"],
    types: ["Planeswalker"],
    subtypes: ["Basri"],
    loyalty: "4",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '+1' }],
            targetDefinitions: [{ type: TargetType.Creature, count: 1, minCount: 0, optional: true }],
            effects: [
                { type: EffectType.AddCounters, amount: 1, counterType: 'P1P1', targetMapping: TargetMapping.Target1 },
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    abilitiesToAdd: ['Vigilance'],
                    layer: 6,
                    targetMapping: TargetMapping.Target1
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-1' }],
            effects: [
                {
                    type: EffectType.AddTriggeredAbility,
                    eventMatch: TriggerEvent.Attack,
                    duration: { type: DurationType.UntilEndOfTurn },
                    effects: [{
                        type: EffectType.AddCounters,
                        targetMapping: TargetMapping.EventTarget,
                        counterType: 'P1P1',
                        amount: 1
                    }]
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-6' }],
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
    ],
    scryfall_id: "2688b45d-9d74-4d9f-9a63-29c82b48d64f",
    image_url: "https://cards.scryfall.io/normal/front/2/6/2688b45d-9d74-4d9f-9a63-29c82b48d64f.jpg?1596168674",
    rarity: "mythic"
};

