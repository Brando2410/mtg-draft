import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const SpringmaneCervin: ImplementableCard = {
    name: 'Springmane Cervin',
    manaCost: '{2}{G}',
    type_line: 'Creature — Elk',
    types: ['Creature'],
    subtypes: ['Elk'],
    power: '3',
    toughness: '2',
    keywords: [],
    colors: ['green'],
    supertypes: [],
    oracleText: 'When Springmane Cervin enters, you gain 2 life.',
    abilities: [
        {
            id: 'springmane_cervin_etb',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.GainLife,
                    amount: 2,
                    targetMapping: 'CONTROLLER'
                }
            ]
        }
    ]
};
