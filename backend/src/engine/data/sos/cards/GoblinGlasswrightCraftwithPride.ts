import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const GoblinGlasswrightCraftwithPride: CardDefinition = {
    name: "Goblin Glasswright",
    manaCost: "{1}{R}",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Goblin", "Sorcerer"],
    power: "2",
    toughness: "2",
    keywords: ["Prepared"],
    oracleText: "This creature enters prepared.",
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
                            abilities: [
                                {
                                    type: AbilityType.Activated,
                                    id: 'Treasure_Mana_Ability',
                                    costs: [
                                        { type: 'Tap', targetMapping: TargetMapping.Self },
                                        { type: 'Sacrifice', targetMapping: TargetMapping.Self }
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
