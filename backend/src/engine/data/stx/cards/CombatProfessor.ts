import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TargetType, TriggerEvent, DurationType } from '@shared/engine_types';

export const CombatProfessor: CardDefinition = {
    name: 'Combat Professor',
    manaCost: '{3}{W}',
    colors: ['W'],
    types: ['Creature'],
    subtypes: ['Bird', 'Cleric'],
    power: "2",
    toughness: "3",
    keywords: ['Flying'],
    oracleText: 'Flying\nAt the beginning of combat on your turn, target creature you control gets +1/+0 and gains vigilance until end of turn.',
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.BeginningOfCombatStep,
            condition: ConditionType.IsYourTurn,
            targetDefinition: {
                count: 1,
                type: TargetType.Creature,
                restrictions: ['youcontrol']
            },
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                targetMapping: TargetMapping.Target1,
                duration: { type: DurationType.UntilEndOfTurn },
                powerModifier: 1,
                abilitiesToAdd: ['Vigilance']
            }]
        }
    ]
};


