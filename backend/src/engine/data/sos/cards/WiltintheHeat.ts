import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const WiltintheHeat: CardDefinition = {
    name: "Wilt in the Heat",
    manaCost: "{2}{R}{W}",
    colors: [
        "R",
        "W"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "This spell costs {2} less to cast if one or more cards left your graveyard this turn.\nWilt in the Heat deals 5 damage to target creature. If that creature would die this turn, exile it instead.",
    abilities: [
        {
            type: AbilityType.Spell,
            costReduction: {
                type: EffectType.CostReduction,
                reductionAmount: '{2}',
                condition: ConditionType.CardsLeftYourGraveyardThisTurn
            },
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1,
            }],
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 5,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    exileOnMoveToGraveyard: true,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};

