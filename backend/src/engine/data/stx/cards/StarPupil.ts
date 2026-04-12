import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const StarPupil: ImplementableCard = {
    name: 'Star Pupil',
    manaCost: '{W}',
    type_line: 'Creature — Human Wizard',
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: '0',
    toughness: '0',
    keywords: [],
    colors: ['white'],
    supertypes: [],
    oracleText: 'Star Pupil enters with a +1/+1 counter on it. When Star Pupil dies, put its counters on target creature you control.',
    abilities: [
        {
            id: 'star_pupil_etb',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'SELF',
                    amount: 1,
                    value: '+1/+1'
                }
            ]
        },
        {
            id: 'star_pupil_death',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Death,
            triggerCondition: (state: any, event: any, source: any) => event.targetId === source.sourceId,
            effects: [
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'TARGET',
                    amount: (state: any, source: any) => (source.counters?.['+1/+1'] || 0),
                    value: '+1/+1'
                }
            ],
            targetDefinition: {
                type: 'Permanent',
                count: 1,
                restrictions: ['Creature', 'YOU_CONTROL']
            }
        }
    ]
};
