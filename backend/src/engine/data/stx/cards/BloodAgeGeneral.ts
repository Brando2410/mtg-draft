import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const BloodAgeGeneral: ImplementableCard = {
    name: 'Blood Age General',
    manaCost: '{1}{R}',
    type_line: 'Creature — Spirit Warrior',
    types: ['Creature'],
    subtypes: ['Spirit', 'Warrior'],
    power: '2',
    toughness: '2',
    keywords: [],
    colors: ['red'],
    supertypes: [],
    oracleText: 'Whenever Blood Age General attacks, other Spirits you control get +1/+0 until end of turn.',
    abilities: [
        {
            id: 'blood_age_general_trigger',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Attack,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'OTHER_SPIRITS_YOU_CONTROL',
                    duration: 'UNTIL_END_OF_TURN',
                    powerModifier: 1,
                    toughnessModifier: 0
                }
            ]
        }
    ]
};
