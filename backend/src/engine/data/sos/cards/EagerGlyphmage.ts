import { CardDefinition, AbilityType, EffectType, TriggerEvent } from '@shared/engine_types';

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
                        image_url: 'https://cards.scryfall.io/art_crop/front/b/d/bd73bc23-28f0-4fa0-8260-26210f9aa0a0.jpg?1624589254'
                    }
                }
            ]
        }
    ],
    "power": "3",
    "toughness": "3"
};
