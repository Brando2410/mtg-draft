import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const StarPupil: CardDefinition = {
        name: 'Star Pupil',
        manaCost: '{W}',
        colors: ['W'],
        types: ['Creature'],
        subtypes: ['Wizard'],
        power: "0",
        toughness: "0",
        oracleText: 'Star Pupil enters the battlefield with a +1/+1 counter on it.\nWhen Star Pupil dies, put its counters on target creature you control.',
        abilities: [
            {
                type: AbilityType.Static,
                effects: [{ type: EffectType.EntersWithCounters, counterType: 'P1P1', amount: 1 }]
            },
            {
                type: AbilityType.Triggered,
                eventMatch: TriggerEvent.Death,
                targetDefinition: {
                    count: 1,
                    type: TargetType.Permanent,
                    restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Source', value: 'CONTROLLER' }]
                },
                effects: [{ type: EffectType.MoveCounters, targetMapping: TargetMapping.Target1 }]
            }
        ]
    };
