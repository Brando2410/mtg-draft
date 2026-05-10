import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';

export const AdNauseam: CardDefinition = {
    name: "Ad Nauseam",
    manaCost: "{3}{B}{B}",
    oracleText: "Reveal the top card of your library and put that card into your hand. You lose life equal to its mana value. You may repeat this process any number of times.",
    colors: ["B"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.AdNauseam
                }
            ]
        }
    ],
    scryfall_id: "a9f2c53e-ff58-4aa8-89a6-4f45628cc571",
    image_url: "https://cards.scryfall.io/normal/front/a/9/a9f2c53e-ff58-4aa8-89a6-4f45628cc571.jpg?1598306470",
    rarity: "rare"
};

