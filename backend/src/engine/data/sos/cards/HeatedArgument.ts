import { AbilityType, CardDefinition, CostType, DurationType, EffectType, SelectionType, TargetMapping, TargetType } from '@shared/engine_types';
    export const HeatedArgument: CardDefinition = {
    name: "Heated Argument",
    manaCost: "{4}{R}",
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
                type: DurationType.Permanent,
                count: 1,
                restrictions: ["Creature"]
            },
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 6,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: 'Choice' as any,
                    label: "Exile a card from your graveyard to deal 2 damage to target's controller?",
                    optional: true,
                    effects: [
                        {
                            type: CostType.Exile,
                            selectionType: SelectionType.Target,
                            targetDefinition: {
                                type: TargetType.CardInGraveyard,
                                count: 1,
                                restrictions: ['YouControl']
                            }
                        },
                        {
                            type: EffectType.DealDamage,
                            amount: 2,
                            targetMapping: TargetMapping.Target1Controller
                        }
                    ],
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
    