import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const ExhilaratingElocution: ImplementableCard = {
    name: 'Exhilarating Elocution',
    manaCost: '{2}{W}{R}',
    type_line: 'Sorcery',
    types: ['Sorcery'],
    subtypes: [],
    power: undefined,
    toughness: undefined,
    keywords: [],
    colors: ['white', 'red'],
    supertypes: [],
    oracleText: 'Put a +1/+1 counter on each creature you control.',
    abilities: [
        {
            id: 'exhilarating_elocution_main',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 1,
                    targetMapping: 'ALL_CREATURES_YOU_CONTROL'
                }
            ]
        }
    ]
};
