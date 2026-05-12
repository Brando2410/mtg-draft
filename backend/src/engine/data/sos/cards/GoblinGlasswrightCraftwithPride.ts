import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from '@shared/engine_types';
export const GoblinGlasswrightCraftwithPride: CardDefinition = {
    name: "Goblin Glasswright // Craft with Pride",
    manaCost: "{1}{R}",
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
                            image_url: "https://cards.scryfall.io/normal/front/4/3/437976e1-9f2d-4560-8451-f7615957d591.jpg?1775828483",
                            abilities: [
                                {
                                    type: AbilityType.Activated,
                                    id: "{T}, Sacrifice this token: Add one mana of any color.",
                                    costs: [
                                        { type: CostType.Tap },
                                        { type: CostType.SacrificeSelf }
                                    ],
                                    effects: [
                                        {
                                            type: EffectType.AddMana,
                                            amount: 1,
                                            manaType: 'ANY'
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
        ],

    },
    scryfall_id: "c85c5f06-dd31-4e2c-97be-2f64d65069ea",
    image_url: "https://cards.scryfall.io/png/front/c/8/c85c5f06-dd31-4e2c-97be-2f64d65069ea.png?1775937759",
    rarity: "common"
};

