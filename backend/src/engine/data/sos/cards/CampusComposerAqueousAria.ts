import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const CampusComposerAqueousAria: CardDefinition = {
    name: "Campus Composer",
    manaCost: "{3}{U}",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Merfolk", "Bard"],
    power: "3",
    toughness: "4",
    keywords: ["Ward {2}", "Prepared"],
    oracleText: "Ward {2}\nThis creature enters prepared.",
    image_url: "https://cards.scryfall.io/png/front/f/a/fac8ac39-ecb4-4142-bf37-131c65660a9b.png?1775937189",
    entersPrepared: true,

    preparedFace: {
        name: "Aqueous Aria",
        image_url: "https://cards.scryfall.io/png/front/f/a/fac8ac39-ecb4-4142-bf37-131c65660a9b.png?1775937189",
        manaCost: "{4}{U}",
        colors: ["U"],
        types: ["Sorcery"],
        oracleText: "Create a 3/3 blue and red Elemental creature token with flying.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.CreateToken,
                        amount: 1,
                        targetMapping: TargetMapping.Controller,
                        tokenBlueprint: {
                            name: "Elemental",
                            power: "3",
                            toughness: "3",
                            colors: ["U", "R"],
                            types: ["Creature"],
                            subtypes: ["Elemental"],
                            keywords: ["Flying"],
                            image_url: "https://cards.scryfall.io/png/front/3/d/3d0b9b88-705e-4df0-8a93-3e240b81355b.png?1682693891"
                        }
                    }
                ]
            }
        ]
    }
};
