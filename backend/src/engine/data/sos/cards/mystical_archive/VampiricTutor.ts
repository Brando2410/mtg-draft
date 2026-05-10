import { AbilityType, CardDefinition, EffectType, Zone } from '@shared/engine_types';

export const VampiricTutor: CardDefinition = {
    name: "Vampiric Tutor",
    manaCost: "{B}",


    colors: ["B"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Search your library for a card, then shuffle and put that card on top. You lose 2 life.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    amount: 1,
                    zone: Zone.Library,
                    position: 'top',
                    reveal: true,
                    shuffle: true
                },
                {
                    type: EffectType.LoseLife,
                    amount: 2
                }
            ]
        }
    ],
    scryfall_id: "db68c546-aca8-45d0-bf45-15b951ce66e5",
    image_url: "https://cards.scryfall.io/normal/front/d/b/db68c546-aca8-45d0-bf45-15b951ce66e5.jpg?1775936619",
    rarity: "mythic"
};

