import { AbilityType, CardDefinition, ConditionType, CostType, DurationType, DynamicAmount, EffectType, TargetMapping } from '@shared/engine_types';
    export const BurrogBarrage: CardDefinition = {
    name: "Burrog Barrage",
    manaCost: "{1}{G}",
    colors: [
        "G"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Target creature you control gets +1/+0 until end of turn if you've cast another instant or sorcery spell this turn. Then it deals damage equal to its power to up to one target creature an opponent controls.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'YouControl'] },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    sublayer: 'Stats',
                    powerModifier: 1,
                    duration: { type: DurationType.UntilEndOfTurn },
                    condition: ConditionType.CastInstantSorceryThisTurn,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: CostType.Choice,
                    label: "Deal damage to up to one target creature an opponent controls?",
                    choices: [
                        {
                            label: "Yes",
                            targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'OpponentControl'] },
                            effects: [
                                {
                                    type: EffectType.DealDamage,
                                    amount: DynamicAmount.Target1Power,
                                    damageSourceMapping: TargetMapping.Target1,
                                    targetMapping: TargetMapping.Target2
                                }
                            ]
                        },
                        { label: "No", effects: [] }
                    ]
                }
            ]
        }
    ]
};
    