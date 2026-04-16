import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const HeatedArgument: CardDefinition = {
    "name": "Heated Argument",
    "manaCost": "{4}{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Heated Argument deals 6 damage to target creature. You may exile a card from your graveyard. If you do, Heated Argument also deals 2 damage to that creature's controller.",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Permanent,
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
                            type: EffectType.Exile,
                            selectionType: 'Target',
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



