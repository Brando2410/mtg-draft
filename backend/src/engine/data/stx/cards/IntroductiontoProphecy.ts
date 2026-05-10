import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';

export const IntroductiontoProphecy: CardDefinition = {
    name: 'Introduction to Prophecy',
    manaCost: '{3}',

    colors: [],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Scry 2, then draw a card.',
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                { type: EffectType.Scry, amount: 2 },
                { type: EffectType.DrawCards, amount: 1 }
            ]
        }
    ],
    scryfall_id: "7820923e-bad2-4d6a-92b3-97b9737d2ca9",
    image_url: "https://cards.scryfall.io/normal/front/7/8/7820923e-bad2-4d6a-92b3-97b9737d2ca9.jpg?1637082328",
    rarity: "common"
};

