import { AbilityType, CardDefinition, ConditionType, EffectType, SelectionType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const SanarUnfinishedGeniusWildIdea: CardDefinition = {
    name: "Sanar, Unfinished Genius // Wild Idea",
    manaCost: "{U}{R}",
    colors: ["U", "R"],
    types: ["Legendary", "Creature"],
    subtypes: ["Goblin", "Sorcerer"],
    power: "0",
    toughness: "4",
    keywords: ["Prepared"],
    oracleText: "Sanar enters prepared.\n{T}: Create a Treasure token. Activate only if you've cast an instant or sorcery spell this turn.",
    entersPrepared: true,
    image_url: "https://cards.scryfall.io/png/front/1/7/173157aa-712d-44f2-89ba-dd2511a07f26.png?1775938553",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Tap' }],
            condition: ConditionType.CastInstantSorceryThisTurn,
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
                                    { type: 'Tap', targetMapping: TargetMapping.Self },
                                    { type: 'Sacrifice', targetMapping: TargetMapping.Self }
                                ],
                                isManaAbility: true
                            }
                        ]
                    }
                }
            ]
        }
    ],

    preparedFace: {
        name: "Wild Idea",
        image_url: "https://cards.scryfall.io/png/front/1/7/173157aa-712d-44f2-89ba-dd2511a07f26.png?1775938553",
        manaCost: "{3}{U}{R}",
        colors: ["U", "R"],
        types: ["Sorcery"],
        oracleText: "Search your library for an instant or sorcery card, reveal it, put it into your hand, then shuffle.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.SearchLibrary,
                        targetDefinition: {
                            type: TargetType.Card,
                            count: 1,
                            restrictions: ['Instant_OR_Sorcery']
                        },
                        zone: Zone.Hand,
                        reveal: true,
                        targetMapping: TargetMapping.Controller
                    }
                ]
            }
        ]
    }
};

