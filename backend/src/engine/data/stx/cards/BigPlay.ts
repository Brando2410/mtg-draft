import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const BigPlay: CardDefinition = {
    name: 'Big Play',
    manaCost: '{1}{G}',
    scryfall_id: "9016d667-50a9-4093-9a99-b34dcdafe60b",
    image_url: "https://cards.scryfall.io/normal/front/9/0/9016d667-50a9-4093-9a99-b34dcdafe60b.jpg?1624592445",
    colors: ['G'],
    types: ['Instant'],
    oracleText: 'Target creature gets +2/+2 until end of turn. Put a +1/+1 counter on it.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                count: 1,
                type: TargetType.Creature
            },
            effects: [
                { type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Target1, duration: { type: DurationType.UntilEndOfTurn }, powerModifier: 2, toughnessModifier: 2 },
                { type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: TargetMapping.Target1 }
            ]
        }
    ]
  };
