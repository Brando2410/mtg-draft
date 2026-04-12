import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const BloodResearcher: ImplementableCard = {
    name: 'Blood Researcher',
    manaCost: '{1}{B}{G}',
    type_line: 'Creature — Vampire Druid',
    types: ['Creature'],
    subtypes: ['Vampire', 'Druid'],
    power: '2',
    toughness: '2',
    keywords: ['Menace'],
    colors: ['black', 'green'],
    supertypes: [],
    oracleText: 'Menace\nWhenever you gain life, put a +1/+1 counter on Blood Researcher.',
    abilities: [
        {
            id: 'blood_researcher_life_trigger',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.LifeGain,
            triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
            effects: [
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'SELF',
                    amount: 1,
                    value: '+1/+1'
                }
            ]
        }
    ]
};
