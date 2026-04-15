import { CardDefinition, AbilityType, EffectType, TargetType, TargetMapping } from '@shared/engine_types';

export const MaelstromArtisanRocketVolley: CardDefinition = {
    name: "Maelstrom Artisan",
    manaCost: "{1}{R}{R}",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Minotaur", "Sorcerer"],
    power: "3",
    toughness: "2",
    keywords: ["Haste", "Prepared"],
    oracleText: "Haste\nThis creature enters prepared.",
    entersPrepared: true,

    preparedFace: {
        name: "Rocket Volley",
        manaCost: "{1}{R}",
        colors: ["R"],
        types: ["Sorcery"],
        oracleText: "Destroy target nonbasic land.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: TargetType.Permanent,
                    count: 1,
                    restrictions: ["Land", "Nonbasic"]
                },
                effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
            }
        ]
    }
};
