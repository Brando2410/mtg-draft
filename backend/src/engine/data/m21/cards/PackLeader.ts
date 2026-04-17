import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const PackLeader: CardDefinition = {
    name: "Pack Leader",
    manaCost: "{1}{W}",
    scryfall_id: "a8b94bc1-68d1-41dc-914c-a33ecb9aeb49",
    image_url: "https://cards.scryfall.io/normal/front/a/8/a8b94bc1-68d1-41dc-914c-a33ecb9aeb49.jpg?1594735110",
    oracleText: "Other Dogs you control get +1/+1.\nWhenever this creature attacks, prevent all combat damage that would be dealt this turn to Dogs you control.",
    colors: ["W"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Dog"],
    power: "2",
    toughness: "2",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                powerModifier: 1,
                toughnessModifier: 1,
                layer: 7,
                targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                restrictions: [
                { type: 'Type', value: 'Dog' },
                { type: 'Type', value: 'other' }
            ]
            }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            condition: (state: any, event: any, source: any) => event.data?.attackerId === source.sourceId,
            effects: [{
                type: EffectType.AddPreventionEffect,
                damageType: 'CombatDamage',
                targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                restrictions: [
                { type: 'Type', value: 'Dog' }
            ],
                duration: { type: DurationType.UntilEndOfTurn }
            }]
        }
    ]
};




