import { AbilityType, CardDefinition, EffectType, TriggerEvent } from '@shared/engine_types';
    export const ImperiousInkmage: CardDefinition = {
    name: "Imperious Inkmage",
    manaCost: "{1}{W}{B}",
    scryfall_id: "d5df1c3f-2536-4476-b8cd-34b026c38366",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/d/5/d5df1c3f-2536-4476-b8cd-34b026c38366.jpg?1775938353",
    colors: [
        "B",
        "W"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Orc",
        "Warlock"
    ],
    keywords: ["Vigilance"],
    oracleText: "Vigilance\nWhen this creature enters, surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.Surveil,
                    amount: 2
                }
            ]
        }
    ],
    power: "3",
    toughness: "3"
};
    
