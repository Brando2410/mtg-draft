import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const ColossusoftheBloodAge: CardDefinition = {
    "name": "Colossus of the Blood Age",
    "manaCost": "{4}{R}{W}",
    "colors": [
        "R",
        "W"
    ],
    "types": [
        "Artifact",
        "Creature"
    ],
    "subtypes": [
        "Construct"
    ],
    "oracleText": "When this creature enters, it deals 3 damage to each opponent and you gain 3 life.\nWhen this creature dies, discard any number of cards, then draw that many cards plus one.",
    "abilities": [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                { type: EffectType.DealDamage, amount: 3, targetMapping: TargetMapping.EachOpponent },
                { type: EffectType.GainLife, amount: 3, targetMapping: TargetMapping.Controller }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Death,
            effects: [
                {
                    type: EffectType.DiscardCards,
                    amount: 'ANY',
                    targetMapping: TargetMapping.Controller,
                    next: {
                        type: EffectType.DrawCards,
                        amount: 'DISCARDED_COUNT_PLUS_1',
                        targetMapping: TargetMapping.Controller
                    }
                }
            ]
        }
    ],
    "power": "6",
    "toughness": "6"
};
