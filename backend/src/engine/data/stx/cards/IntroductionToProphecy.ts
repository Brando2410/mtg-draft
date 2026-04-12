import { AbilityType, ImplementableCard, ZoneRequirement, EffectType } from '@shared/engine_types';

export const IntroductionToProphecy: ImplementableCard = {
    name: 'Introduction to Prophecy',
    manaCost: '{3}',
    type_line: 'Sorcery — Lesson',
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    power: '0',
    toughness: '0',
    keywords: [],
    colors: [],
    supertypes: [],
    oracleText: 'Scry 2, then draw a card.',
    abilities: [
        {
            id: 'introduction_to_prophecy_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                {
                    type: EffectType.Scry,
                    targetMapping: 'CONTROLLER',
                    amount: 2
                },
                {
                    type: EffectType.DrawCards,
                    targetMapping: 'CONTROLLER',
                    amount: 1
                }
            ]
        }
    ]
};
