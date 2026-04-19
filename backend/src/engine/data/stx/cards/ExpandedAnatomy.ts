import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const ExpandedAnatomy: CardDefinition = {
    name: 'Expanded Anatomy',
    manaCost: '{3}',
    scryfall_id: "c5642b9d-0daa-4e6b-ad48-f88dd37d6574",
    image_url: "https://cards.scryfall.io/normal/front/c/5/c5642b9d-0daa-4e6b-ad48-f88dd37d6574.jpg?1637082010",
    colors: [],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Put two +1/+1 counters on target creature. It gains vigilance until end of turn.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                count: 1,
                type: TargetType.Creature
            },
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: 'P1P1',
                    amount: 2,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    abilitiesToAdd: ['Vigilance'],
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};

