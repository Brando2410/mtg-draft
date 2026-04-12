import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType } from '@shared/engine_types';

export const IntroductionToAnnihilation: ImplementableCard = {
    name: 'Introduction to Annihilation',
    manaCost: '{5}',
    type_line: 'Sorcery — Lesson',
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    power: '0',
    toughness: '0',
    keywords: [],
    colors: [],
    supertypes: [],
    oracleText: 'Exile target nonland permanent. Its controller draws a card.',
    abilities: [
        {
            id: 'introduction_to_annihilation_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                {
                    type: EffectType.Exile,
                    targetMapping: 'TARGET_1'
                },
                {
                    type: EffectType.DrawCards,
                    targetMapping: 'TARGET_1_CONTROLLER', 
                    amount: 1
                }
            ],
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: ['nonland']
            }
        }
    ]
};
