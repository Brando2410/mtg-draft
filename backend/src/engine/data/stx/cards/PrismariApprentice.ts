import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const PrismariApprentice: ImplementableCard = {
    name: 'Prismari Apprentice',
    manaCost: '{U}{R}',
    type_line: 'Creature — Human Shaman',
    types: ['Creature'],
    subtypes: ['Human', 'Shaman'],
    power: '2',
    toughness: '2',
    keywords: [],
    colors: ['blue', 'red'],
    supertypes: [],
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, Prismari Apprentice can’t be blocked this turn. If that spell has mana value 5 or greater, put a +1/+1 counter on Prismari Apprentice.',
    abilities: [
        {
            id: 'prismari_apprentice_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'SELF',
                    duration: 'UNTIL_END_OF_TURN',
                    abilitiesToAdd: ['CannotBeBlocked']
                },
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'SELF',
                    amount: 1,
                    value: '+1/+1',
                    condition: 'EVENT_MANA_VALUE_GE:5'
                }
            ]
        }
    ]
};
