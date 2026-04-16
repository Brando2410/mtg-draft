import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
    export const ScoldingAdministrator: CardDefinition = {
    name: "Scolding Administrator",
    manaCost: "{W}{B}",
    colors: [
        "B",
        "W"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Dwarf",
        "Cleric"
    ],
    keywords: ["Menace"],
    oracleText: "Menace (This creature can't be blocked except by two or more creatures.)\nRepartee — Whenever you cast an instant or sorcery spell that targets a creature, put a +1/+1 counter on this creature.\nWhen this creature dies, if it had counters on it, put those counters on up to one target creature.",
    power: "2",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: "REPARTEE_TRIGGER",
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 1,
                    counterType: '+1/+1',
                    targetMapping: TargetType.Self
                }
            ]
        },
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Death,
            condition: ConditionType.HasCounters,
            targetDefinition: {
                type: "Creature",
                count: 1,
                optional: true
            },
            effects: [
                {
                    type: EffectType.MoveCounters,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
    