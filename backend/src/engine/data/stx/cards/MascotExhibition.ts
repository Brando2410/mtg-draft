import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType } from '@shared/engine_types';

export const MascotExhibition: ImplementableCard = {
    name: 'Mascot Exhibition',
    manaCost: '{7}',
    type_line: 'Sorcery — Lesson',
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    power: undefined,
    toughness: undefined,
    keywords: [],
    colors: [],
    supertypes: [],
    oracleText: "Create a 2/1 white and black Inkling creature token with flying, a 3/2 red and white Spirit creature token, and a 4/4 blue and red Elemental creature token.",
    abilities: [
        {
            id: 'mascot_exhibition_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                {
                    type: EffectType.CreateToken,
                    targetMapping: 'CONTROLLER',
                    amount: 1,
                    tokenBlueprint: {
                        name: 'Inkling',
                        power: '2', toughness: '1',
                        colors: ['white', 'black'],
                        types: ['Creature'],
                        subtypes: ['Inkling'],
                        keywords: ['Flying']
                    }
                },
                {
                    type: EffectType.CreateToken,
                    targetMapping: 'CONTROLLER',
                    amount: 1,
                    tokenBlueprint: {
                        name: 'Spirit',
                        power: '3', toughness: '2',
                        colors: ['red', 'white'],
                        types: ['Creature'],
                        subtypes: ['Spirit']
                    }
                },
                {
                    type: EffectType.CreateToken,
                    targetMapping: 'CONTROLLER',
                    amount: 1,
                    tokenBlueprint: {
                        name: 'Elemental',
                        power: '4', toughness: '4',
                        colors: ['blue', 'red'],
                        types: ['Creature'],
                        subtypes: ['Elemental']
                    }
                }
            ]
        }
    ]
};
