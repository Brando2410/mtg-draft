import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

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
            condition: 'IS_YOUR_TURN',
            targetDefinition: {
                count: 1,
                type: TargetType.Permanent,
                restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Source', value: 'CONTROLLER' }]
            },
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                targetMapping: TargetMapping.Target1,
                duration: 'UNTIL_END_OF_TURN',
                powerModifier: 1,
                abilitiesToAdd: ['Vigilance']
            }]
        }
    ]
  };
