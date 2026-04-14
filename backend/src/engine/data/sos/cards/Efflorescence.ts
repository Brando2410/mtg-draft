import { CardDefinition, AbilityType, EffectType, TargetMapping, DurationType } from '@shared/engine_types';

export const Efflorescence: CardDefinition = {
    "name": "Efflorescence",
    "manaCost": "{2}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Put two +1/+1 counters on target creature.\nInfusion — If you gained life this turn, that creature also gains trample and indestructible until end of turn.",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
            effects: [
                { 
                    type: EffectType.AddCounters, 
                    amount: 2, 
                    value: '+1/+1', 
                    targetMapping: TargetMapping.Target1 
                },
                { 
                    type: EffectType.ApplyContinuousEffect, 
                    condition: 'GAINED_LIFE_THIS_TURN',
                    duration: { type: DurationType.UntilEndOfTurn }, 
                    abilitiesToAdd: ['Trample', 'Indestructible'], 
                    targetMapping: TargetMapping.Target1 
                }
            ]
        }
    ]
};
