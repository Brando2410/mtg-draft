import { AbilityType, CardDefinition, EffectType, Restriction, TriggerEvent, Zone } from '@shared/engine_types';

export const QuandrixApprentice: CardDefinition = {
    name: "Quandrix Apprentice",
    manaCost: "{G}{U}",
    colors: ["G", "U"],
    types: ["Creature"],
    subtypes: ["Human", "Wizard"],
    power: "2",
    toughness: "2",
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, look at the top three cards of your library. You may reveal a land card from among them and put it into your hand. Put the rest on the bottom of your library in any order.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.LookAtTopAndPick,
                    fromTop: 3,
                    optional: true,
                    restrictions: [Restriction.Land],
                    reveal: true,
                    zone: Zone.Hand,
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom',
                    shuffleRemainder: true
                }
            ]
        }
    ],
    scryfall_id: "f9166814-8748-480a-b7a0-816f9f582420",
    image_url: "https://cards.scryfall.io/normal/front/f/9/f9166814-8748-480a-b7a0-816f9f582420.jpg?1775941866",
    rarity: "uncommon"
};

