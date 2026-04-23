import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';

export const Preordain: CardDefinition = {
    name: "Preordain",
    manaCost: "{U}",
    scryfall_id: "8221b564-acf0-4d82-94f5-2ba1337ff5e1",
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/8/2/8221b564-acf0-4d82-94f5-2ba1337ff5e1.jpg?1775936514",
    colors: ["U"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: ["Scry"],
    oracleText: "Scry 2, then draw a card. (To scry 2, look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.Scry,
                    amount: 2
                },
                {
                    type: EffectType.DrawCards,
                    amount: 1
                }
            ]
        }
    ]
};
