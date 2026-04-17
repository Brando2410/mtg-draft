import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';
    export const LandscapePainterVibrantIdea: CardDefinition = {
    name: "Landscape Painter",
    manaCost: "{1}{U}",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Merfolk", "Wizard"],
    keywords: ["Prepared"],
    oracleText: "This creature enters prepared.",
    power: "2",
    toughness: "1",

    entersPrepared: true,
    image_url: "https://cards.scryfall.io/png/front/c/0/c0bd30c4-3cdf-4eda-8be5-0fb5e5ddddbf.png?1775937300",
    preparedFace: {
        name: "Vibrant Idea",
        image_url: "https://cards.scryfall.io/png/front/c/0/c0bd30c4-3cdf-4eda-8be5-0fb5e5ddddbf.png?1775937300",
        manaCost: "{4}{U}",
        colors: ["U"],
        types: ["Sorcery"],
        oracleText: "Draw two cards.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [{ type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Controller }]
            }
        ]
    }
};
    
