import { AbilityType, CardDefinition, EffectType, TriggerEvent } from '@shared/engine_types';

export const EagerGlyphmage: CardDefinition = {
    "name": "Eager Glyphmage",
    "manaCost": "{3}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Cat",
        "Cleric"
    ],
    "oracleText": "When this creature enters, create a 1/1 white and black Inkling creature token with flying.",
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                { 
                    type: EffectType.CreateToken, 
                    tokenBlueprint: {
                        name: 'Inkling',
                        colors: ['W', 'B'],
                        types: ['Creature'],
                        subtypes: ['Inkling'],
                        power: 1,
                        toughness: 1,
                        keywords: ['Flying'],
                        image_url: 'https://cards.scryfall.io/png/front/c/9/c9deae5c-80d4-4701-b425-91853b7ee03b.png?1682693898'
                    }
                }
            ]
        }
    ],
    "power": "3",
    "toughness": "3"
};




