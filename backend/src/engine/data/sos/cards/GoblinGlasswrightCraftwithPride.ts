import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from '@shared/engine_types';
    export const GoblinGlasswrightCraftwithPride: CardDefinition = {
    name: "Goblin Glasswright",
    manaCost: "{1}{R}",
    scryfall_id: "c85c5f06-dd31-4e2c-97be-2f64d65069ea",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/c/8/c85c5f06-dd31-4e2c-97be-2f64d65069ea.jpg?1775937759",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Goblin", "Sorcerer"],
    keywords: ["Prepared"],
    oracleText: "This creature enters prepared.",
    power: "2",
    toughness: "2",

    entersPrepared: true,
    preparedFace: {
        name: "Craft with Pride",
        image_url: "https://cards.scryfall.io/png/front/c/8/c85c5f06-dd31-4e2c-97be-2f64d65069ea.png?1775937759",
        manaCost: "{R}",
        colors: ["R"],
        types: ["Sorcery"],
        oracleText: "Create a Treasure token.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.CreateToken,
                        tokenBlueprint: {
                            name: "Treasure",
                            colors: [],
                            types: ["Artifact", "Token"],
                            subtypes: ["Treasure"],
                            oracleText: "{T}, Sacrifice this token: Add one mana of any color.",
                            image_url: "https://cards.scryfall.io/png/front/1/a/1a2d027f-8996-4761-a776-47cd428f6779.png?1641306162",
                            abilities: [
                                {
                                    type: AbilityType.Activated,
                                    id: 'Treasure_Mana_Ability',
                                    costs: [
                                        { type: CostType.Tap, targetMapping: TargetMapping.Self },
                                        { type: CostType.Sacrifice, targetMapping: TargetMapping.Self }
                                    ],
                                    effects: [
                                        {
                                            type: EffectType.AddMana,
                                            manaType: '{ANY}'
                                        }
                                    ],
                                    isManaAbility: true
                                }
                            ]
                        },
                        amount: 1,
                        targetMapping: TargetMapping.Controller
                    }
                ]
            }
        ]
    }
};
    
