import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const RainofRevelation: CardDefinition = {
    name: "Rain of Revelation",
    manaCost: "{3}{U}",
    scryfall_id: "da367981-9d6f-419f-9f58-f969b6183336",
    image_url: "https://cards.scryfall.io/normal/front/d/a/da367981-9d6f-419f-9f58-f969b6183336.jpg?1594735631",
    oracleText: "Draw three cards, then discard a card.",
    colors: ["U"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                { type: EffectType.DrawCards, amount: 3, targetMapping: TargetMapping.Controller },
                { type: EffectType.DiscardCards, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        }
    ]
};


