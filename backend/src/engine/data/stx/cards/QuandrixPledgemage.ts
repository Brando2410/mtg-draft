import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const QuandrixPledgemage: ImplementableCard = {
    name: 'Quandrix Pledgemage',
    manaCost: '{1}{GU}{GU}',
    type_line: 'Creature — Merfolk Druid',
    types: ['Creature'],
    subtypes: ['Merfolk', 'Druid'],
    power: '2',
    toughness: '2',
    keywords: [],
    colors: ['green', 'blue'],
    supertypes: [],
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, put a +1/+1 counter on Quandrix Pledgemage.',
    abilities: [
        {
            id: 'quandrix_pledgemage_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Magecraft,
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
