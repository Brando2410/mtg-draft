import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const GarrisonExcavator: CardDefinition = {
    "name": "Garrison Excavator",
    "manaCost": "{3}{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Orc",
        "Sorcerer"
    ],
    "keywords": ["Menace"],
    "oracleText": "Menace (This creature can't be blocked except by two or more creatures.)\nWhenever one or more cards leave your graveyard, create a 2/2 red and white Spirit creature token.",
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.LeaveGraveyard,
            condition: 'PLAYER_IS_CONTROLLER',
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Spirit',
                        colors: ['R', 'W'],
                        types: ['Creature'],
                        subtypes: ['Spirit'],
                        power: 2,
                        toughness: 2,
                        keywords: ['Flying'],
                        image_url: 'https://cards.scryfall.io/png/front/f/9/f98c0167-7434-4607-87c4-315fa8b6972e.png?1682693862'
                    }
                }
            ]
        }
    ],
    "power": "3",
    "toughness": "4"
};





