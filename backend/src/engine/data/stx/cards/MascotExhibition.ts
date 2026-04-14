import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const MascotExhibition: CardDefinition = {
        name: 'Mascot Exhibition',
        manaCost: '{7}',
        colors: [],
        types: ['Sorcery'],
        subtypes: ['Lesson'],
        oracleText: "Create a 2/1 white and black Inkling creature token with flying, a 3/2 red and white Spirit creature token, and a 4/4 blue and red Elemental creature token.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.CreateToken,
                        tokenBlueprint: { name: 'Inkling', power: "2", toughness: "1", keywords: ['Flying'], colors: ['W', 'B'], types: ['Creature', 'Token'], subtypes: ['Inkling'], image_url: 'https://cards.scryfall.io/large/front/c/9/c9deae5c-80d4-4701-b425-91853b7ee03b.jpg?1682693898' },
                        targetMapping: TargetMapping.Controller,
                        amount: 1
                    },
                    {
                        type: EffectType.CreateToken,
                        tokenBlueprint: { name: 'Spirit', power: "3", toughness: "2", colors: ['R', 'W'], types: ['Creature', 'Token'], subtypes: ['Spirit'], image_url: 'https://cards.scryfall.io/large/front/f/9/f98c0167-7434-4607-87c4-315fa8b6972e.jpg?1682693862' },
                        targetMapping: TargetMapping.Controller,
                        amount: 1
                    },
                    {
                        type: EffectType.CreateToken,
                        tokenBlueprint: { name: 'Elemental', power: "4", toughness: "4", colors: ['U', 'R'], types: ['Creature', 'Token'], subtypes: ['Elemental'], image_url: 'https://cards.scryfall.io/large/front/3/d/3d0b9b88-705e-4df0-8a93-3e240b81355b.jpg?1682693891' },
                        targetMapping: TargetMapping.Controller,
                        amount: 1
                    }
                ]
            }
        ]
    };
