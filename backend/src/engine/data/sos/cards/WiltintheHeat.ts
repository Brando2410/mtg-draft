import { CardDefinition, AbilityType, EffectType, TargetMapping, DurationType, TargetType } from '@shared/engine_types';

export const WiltintheHeat: CardDefinition = {
    "name": "Wilt in the Heat",
    "manaCost": "{2}{R}{W}",
    "colors": [
        "R",
        "W"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "This spell costs {2} less to cast if one or more cards left your graveyard this turn.\nWilt in the Heat deals 5 damage to target creature. If that creature would die this turn, exile it instead.",
    "abilities": [
        {
            type: AbilityType.Spell,
            costReduction: {
                type: EffectType.CostReduction,
                manaReduction: '{2}',
                condition: 'CARDS_LEFT_YOUR_GRAVEYARD_THIS_TURN'
            } as any,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: [{ type: 'Type', value: 'Creature' }]
            },
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 5,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: DurationType.UntilEndOfTurn,
                    replacementEffect: {
                    eventMatch: 'ON_DEATH',
                        condition: 'EVENT_OBJECT_IS_TARGET_1',
                        effects: [{ type: EffectType.Exile, targetMapping: TargetMapping.EventTarget }]
                    },
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};




