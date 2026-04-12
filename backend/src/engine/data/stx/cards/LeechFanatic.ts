import { AbilityType, ImplementableCard, ZoneRequirement, EffectType } from '@shared/engine_types';

export const LeechFanatic: ImplementableCard = {
    name: 'Leech Fanatic',
    manaCost: '{1}{B}',
    type_line: 'Creature — Human Warlock',
    types: ['Creature'],
    subtypes: ['Human', 'Warlock'],
    power: '2',
    toughness: '2',
    keywords: [],
    colors: ['black'],
    supertypes: [],
    oracleText: 'During your turn, Leech Fanatic has lifelink.',
    abilities: [
        {
            id: 'leech_fanatic_lifelink',
            type: AbilityType.Static,
            activeZone: ZoneRequirement.Battlefield,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'SELF',
                    condition: 'IS_YOUR_TURN',
                    abilitiesToAdd: ['Lifelink']
                }
            ]
        }
    ]
};
