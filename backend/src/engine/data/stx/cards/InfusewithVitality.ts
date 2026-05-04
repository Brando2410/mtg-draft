import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const InfusewithVitality: CardDefinition = {
    name: 'Infuse with Vitality',
    manaCost: '{B}{G}',
    scryfall_id: "840600a9-3e78-48a6-b75b-860446b82c1b",
    image_url: "https://cards.scryfall.io/normal/front/8/4/840600a9-3e78-48a6-b75b-860446b82c1b.jpg?1627429284",
    colors: ['B', 'G'],
    types: ['Instant'],
    oracleText: 'Until end of turn, target creature gains deathtouch and "When this creature dies, return it to the battlefield tapped under its owner\'s control and you gain 2 life."',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                count: 1,
                type: TargetType.Creature
            }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    abilitiesToAdd: ['Deathtouch'],
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1,
                    abilitiesToAdd: [{
                        type: AbilityType.Triggered,
                        eventMatch: TriggerEvent.Death,
                        effects: [
                            {
                                type: EffectType.MoveToZone,
                                zone: Zone.Battlefield,
                                entersTapped: true,
                                targetMapping: TargetMapping.Self
                            },
                            {
                                type: EffectType.GainLife,
                                amount: 2,
                                targetMapping: TargetMapping.Controller
                            }
                        ]
                    }]
                }
            ]
        }
    ]
};
