import { AbilityType, CardDefinition, ConditionType, EffectType, TriggerEvent } from '@shared/engine_types';
    export const GarrisonExcavator: CardDefinition = {
    name: "Garrison Excavator",
    manaCost: "{3}{R}",
    scryfall_id: "f11d2846-f181-4751-82ac-1e1ced6f46c7",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/f/1/f11d2846-f181-4751-82ac-1e1ced6f46c7.jpg?1775937750",
    colors: [
        "R"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Orc",
        "Sorcerer"
    ],
    keywords: ["Menace"],
    oracleText: "Menace (This creature can't be blocked except by two or more creatures.)\nWhenever one or more cards leave your graveyard, create a 2/2 red and white Spirit creature token.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.LeaveGraveyard,
            condition: ConditionType.PlayerIsController,
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
                    }
                }
            ]
        }
    ],
    power: "3",
    toughness: "4"
};
    
