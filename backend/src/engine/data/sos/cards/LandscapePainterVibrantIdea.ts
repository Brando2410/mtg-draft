import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const LandscapePainterVibrantIdea: CardDefinition = {
    name: "Landscape Painter",
    manaCost: "{1}{U}",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Merfolk", "Wizard"],
    power: "2",
    toughness: "1",
    keywords: ["Prepared"],
    oracleText: "This creature enters prepared.",
    entersPrepared: true,

    preparedFace: {
        name: "Vibrant Idea",
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
