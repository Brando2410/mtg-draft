import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const HallMonitor: CardDefinition = {
    name: 'Hall Monitor',
    manaCost: '{R}',
    colors: ['R'],
    types: ['Creature'],
    subtypes: ['Lizard', 'Wizard'],
    power: "1",
    toughness: "1",
    keywords: ['Haste'],
    oracleText: 'Haste\n{1}{R}, {T}: Target creature can\'t block this turn.',
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Mana', value: '{1}{R}' }, { type: 'Tap' }],
            targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }] },
            effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Target1, duration: 'UNTIL_END_OF_TURN', cannotBlock: true }]
        }
    ]
  };
