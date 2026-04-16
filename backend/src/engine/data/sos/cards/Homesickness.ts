import { CardDefinition, AbilityType, EffectType, TargetType, TargetMapping } from '@shared/engine_types';

export const Homesickness: CardDefinition = {
    "name": "Homesickness",
    "manaCost": "{4}{U}{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Target player draws two cards. Tap up to two target creatures. Put a stun counter on each of them. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: [
                {
                    type: TargetType.Player,
                    count: 1,
                    label: "Target player to draw cards"
                },
                {
                    type: TargetType.Creature,
                    count: 2,
                    minCount: 0,
                    label: "Up to two target creatures to stun"
                }
            ],
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 2,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.Tap,
                    targetMapping: TargetMapping.Target2
                },
                {
                    type: EffectType.AddCounters,
                    counterType: 'stun',
                    amount: 1,
                    targetMapping: TargetMapping.Target2
                }
            ]
        }
    ]
};


