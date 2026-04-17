import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const MaelstromArtisanRocketVolley: CardDefinition = {
    name: "Maelstrom Artisan // Rocket Volley",
    manaCost: "{1}{R}{R}",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Minotaur", "Sorcerer"],
    keywords: ["Haste", "Prepared"],
    oracleText: "Haste\nThis creature enters prepared.",
    power: "3",
    toughness: "2",

    entersPrepared: true,
    image_url: "https://cards.scryfall.io/png/front/5/c/5c88391d-271f-4021-a5d9-158ebc1e6357.png?1775937805",
    preparedFace: {
        name: "Rocket Volley",
        image_url: "https://cards.scryfall.io/png/front/5/c/5c88391d-271f-4021-a5d9-158ebc1e6357.png?1775937805",
        manaCost: "{1}{R}",
        colors: ["R"],
        types: ["Sorcery"],
        oracleText: "Destroy target nonbasic land.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: TargetType.Creature,
                    count: 1,
                    restrictions: [
                "Land",
                "nonbasic"
            ]
                },
                effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
            }
        ]
    }
};
    
