import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const IlluminateHistory: CardDefinition = {
        name: 'Illuminate History',
        manaCost: '{2}{R}{R}',
    scryfall_id: "98739789-80b5-4224-a2e4-09e00654aa9d",
    image_url: "https://cards.scryfall.io/normal/front/9/8/98739789-80b5-4224-a2e4-09e00654aa9d.jpg?1637082308",
        colors: ['R'],
        types: ['Sorcery'],
        subtypes: ['Lesson'],
        oracleText: 'Discard any number of cards, then draw that many cards. Create a 3/2 red and white Spirit creature token. Exile Illuminate History.',
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    { type: EffectType.DiscardCards, amount: 'ANY', label: 'Discard any number of cards' },
                    { type: EffectType.DrawCards, amount: 'DISCARDED_COUNT', targetMapping: TargetMapping.Controller },
                    {
                        type: EffectType.CreateToken,
                        tokenBlueprint: { name: 'Spirit', power: "3", toughness: "2", colors: ['R', 'W'], types: ['Creature', 'Token'], subtypes: ['Spirit'], image_url: 'https://cards.scryfall.io/large/front/f/9/f98c0167-7434-4607-87c4-315fa8b6972e.jpg?1682693862' },
                        targetMapping: TargetMapping.Controller,
                        amount: 1
                    },
                    { type: EffectType.Exile, targetMapping: TargetMapping.Self }
                ]
            }
        ]
    };

