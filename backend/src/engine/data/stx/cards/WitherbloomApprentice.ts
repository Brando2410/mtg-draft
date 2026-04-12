import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const WitherbloomApprentice: ImplementableCard = {
    name: 'Witherbloom Apprentice',
    manaCost: '{B}{G}',
    type_line: 'Creature — Human Druid',
    types: ['Creature'],
    subtypes: ['Human', 'Druid'],
    power: '2',
    toughness: '2',
    keywords: [],
    colors: ['black', 'green'],
    supertypes: [],
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, each opponent loses 1 life and you gain 1 life.',
    abilities: [
        {
            id: 'witherbloom_apprentice_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.LoseLife,
                    amount: 1,
                    targetMapping: 'OPPONENT'
                },
                {
                    type: EffectType.GainLife,
                    amount: 1,
                    targetMapping: 'CONTROLLER'
                }
            ]
        }
    ]
};
