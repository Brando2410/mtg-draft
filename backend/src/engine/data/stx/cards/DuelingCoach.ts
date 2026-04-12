import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const DuelingCoach: ImplementableCard = {
    name: 'Dueling Coach',
    manaCost: '{3}{W}',
    type_line: 'Creature — Human Monk',
    types: ['Creature'],
    subtypes: ['Human', 'Monk'],
    power: '2',
    toughness: '2',
    keywords: [],
    colors: ['white'],
    supertypes: [],
    oracleText: 'When Dueling Coach enters, put a +1/+1 counter on target creature. {4}{W}, {T}: Put a +1/+1 counter on each creature you control with a +1/+1 counter on it.',
    abilities: [
        {
            id: 'dueling_coach_etb',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'TARGET',
                    amount: 1,
                    value: '+1/+1'
                }
            ],
            targetDefinition: {
                type: 'Permanent',
                count: 1,
                restrictions: ['Creature']
            }
        },
        {
            id: 'dueling_coach_activated',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Mana', value: '{4}{W}' }, { type: 'Tap' }],
            effects: [
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'CREATURES_YOU_CONTROL_WITH_COUNTER',
                    amount: 1,
                    value: '+1/+1'
                }
            ]
        }
    ]
};
