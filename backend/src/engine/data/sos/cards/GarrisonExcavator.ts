import { AbilityType, CardDefinition, ConditionType, EffectType, TriggerEvent } from '@shared/engine_types';
export const GarrisonExcavator: CardDefinition = {
    name: "Garrison Excavator",
    manaCost: "{3}{R}",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Orc", "Sorcerer"],
    power: "3",
    toughness: "4",
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
                        image_url: "https://cards.scryfall.io/normal/front/8/7/877f7ddb-ed70-41a0-b845-d9bf8ac65f9b.jpg?1775828448"
                    }
                }
            ]
        }
    ],
    scryfall_id: "f11d2846-f181-4751-82ac-1e1ced6f46c7",
    image_url: "https://cards.scryfall.io/normal/front/f/1/f11d2846-f181-4751-82ac-1e1ced6f46c7.jpg?1775937750",
    rarity: "uncommon"
};

