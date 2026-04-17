import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
export const FractalMascot: CardDefinition = {
    name: "Fractal Mascot",
    manaCost: "{4}{G}{U}",
    colors: [
        "G",
        "U"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Fractal",
        "Elk"
    ],
    keywords: ["Trample"],
    power: "6",
    toughness: "6",
    oracleText: "Trample\nWhen this creature enters, tap target creature an opponent controls. Put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
                restrictions: [
                    "opponentcontrol"
                ]
            },
            effects: [
                {
                    type: CostType.Tap,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.AddCounters,
                    counterType: 'stun',
                    amount: 1,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
