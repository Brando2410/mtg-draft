import { AbilityType, ImplementableCard, ZoneRequirement, EffectType } from '@shared/engine_types';

export const HallMonitor: ImplementableCard = {
    name: 'Hall Monitor',
    manaCost: '{R}',
    type_line: 'Creature — Lizard Shaman',
    types: ['Creature'],
    subtypes: ['Lizard', 'Shaman'],
    power: '1',
    toughness: '1',
    keywords: ['Haste'],
    colors: ['red'],
    supertypes: [],
    oracleText: 'Haste. {1}{R}, {T}: Target creature can’t block this turn.',
    abilities: [
        {
            id: 'hall_monitor_activated',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Mana', value: '{1}{R}' }, { type: 'Tap' }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'TARGET',
                    duration: 'UNTIL_END_OF_TURN',
                    abilitiesToAdd: ['CannotBlock']
                }
            ],
            targetDefinition: {
                type: 'Permanent',
                count: 1,
                restrictions: ['Creature']
            }
        }
    ]
};
