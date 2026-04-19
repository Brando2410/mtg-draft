import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';
export const HeatedArgument: CardDefinition = {
    name: "Heated Argument",
    manaCost: "{4}{R}",
    scryfall_id: "0038d212-3d95-4f98-8c2e-7b2404d0ced7",
    image_url: "https://cards.scryfall.io/normal/front/0/0/0038d212-3d95-4f98-8c2e-7b2404d0ced7.jpg?1775937767",
    colors: [
        "R"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Heated Argument deals 6 damage to target creature. You may exile a card from your graveyard. If you do, Heated Argument also deals 2 damage to that creature's controller.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1
            },
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 6,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.Choice,
                    label: "Exile a card from your graveyard to deal 2 damage to target's controller?",
                    choices: [
                        {
                            label: "Yes",
                            condition: "GRAVEYARD_COUNT_GE:1",
                            costs: [
                                {
                                    type: CostType.Exile,
                                    amount: 1,
                                    sourceZones: [Zone.Graveyard]
                                }
                            ],
                            effects: [
                                {
                                    type: EffectType.DealDamage,
                                    amount: 2,
                                    targetMapping: TargetMapping.Target1Controller
                                }
                            ]
                        },
                        {
                            label: "No",
                            effects: []
                        }
                    ],
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
