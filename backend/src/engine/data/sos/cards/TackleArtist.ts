import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const TackleArtist: CardDefinition = {
    "name": "Tackle Artist",
    "manaCost": "{3}{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Orc",
        "Sorcerer"
    ],
    "oracleText": "Trample\nOpus — Whenever you cast an instant or sorcery spell, put a +1/+1 counter on this creature. If five or more mana was spent to cast that spell, put two +1/+1 counters on this creature instead.",
    "keywords": ["Trample"],
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastSpell,
            condition: 'PLAYER_IS_CONTROLLER && (EVENT_OBJECT_MATCHES:Instant || EVENT_OBJECT_MATCHES:Sorcery)',
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 2,
                    counterType: 'p1p1',
                    condition: 'SPENT_MANA_GE:5',
                    targetMapping: TargetMapping.Self
                },
                {
                    type: EffectType.AddCounters,
                    amount: 1,
                    counterType: 'p1p1',
                    condition: 'SPENT_MANA_LT:5',
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    "power": "4",
    "toughness": "3"
};



