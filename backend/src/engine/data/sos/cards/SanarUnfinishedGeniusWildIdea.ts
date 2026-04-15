import { CardDefinition, AbilityType, EffectType, TargetMapping, Zone, SelectionType, ConditionType } from '@shared/engine_types';

export const SanarUnfinishedGeniusWildIdea: CardDefinition = {
    name: "Sanar, Unfinished Genius",
    manaCost: "{U}{R}",
    colors: ["U", "R"],
    types: ["Legendary", "Creature"],
    subtypes: ["Goblin", "Sorcerer"],
    power: "0",
    toughness: "4",
    keywords: ["Prepared"],
    oracleText: "Sanar enters prepared.\n{T}: Create a Treasure token. Activate only if you've cast an instant or sorcery spell this turn.",
    entersPrepared: true,
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
                        types: ["Artifact"],
                        subtypes: ["Treasure"],
                        oracleText: "{T}, Sacrifice this artifact: Add one mana of any color.",
                        abilities: [
                            {
                                type: AbilityType.Activated,
                                isManaAbility: true,
                                costs: [{ type: 'TapSelection' }, { type: 'Sacrifice', targetMapping: TargetMapping.Self }],
                                effects: [{ type: EffectType.AddMana, value: '{ANY}' }]
                            }
                        ]
                    }
                }
            ]
        }
    ],

    preparedFace: {
        name: "Wild Idea",
        manaCost: "{3}{U}{R}",
        colors: ["U", "R"],
        types: ["Sorcery"],
        oracleText: "Search your library for an instant or sorcery card, reveal it, put it into your hand, then shuffle.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.MoveToZone,
                        selectionType: SelectionType.Search,
                        sourceZones: [Zone.Library],
                        destination: Zone.Hand,
                        restrictions: [{ types: ['Instant', 'Sorcery'] }],
                        reveal: true,
                        shuffle: true,
                        amount: 1
                    }
                ]
            }
        ]
    }
};
