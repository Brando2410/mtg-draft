import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';
export const CampusComposerAqueousAria: CardDefinition = {
    name: "Campus Composer",
    manaCost: "{3}{U}",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Merfolk", "Bard"],
    keywords: ["Ward {2}", "Prepared"],
    oracleText: "Ward {2}\nThis creature enters prepared.",
    power: "3",
    toughness: "4",

    entersPrepared: true,
    preparedFace: {
        name: "Aqueous Aria",

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
                            image_url: "https://cards.scryfall.io/normal/front/5/7/57b98846-85e3-47c7-a903-29953d0b0e8a.jpg?1775828504"
                        }
                    }
                ]
            }
        ],

    },
    scryfall_id: "fac8ac39-ecb4-4142-bf37-131c65660a9b",
    image_url: "https://cards.scryfall.io/png/front/f/a/fac8ac39-ecb4-4142-bf37-131c65660a9b.png?1775937189",
    rarity: "uncommon"
};

