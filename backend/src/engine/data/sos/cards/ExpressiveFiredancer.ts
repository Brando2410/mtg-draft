import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const ExpressiveFiredancer: CardDefinition = {
    "name": "Expressive Firedancer",
    "manaCost": "{1}{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Human",
        "Sorcerer"
    ],
    "oracleText": "Opus — Whenever you cast an instant or sorcery spell, this creature gets +1/+1 until end of turn. If five or more mana was spent to cast that spell, this creature also gains double strike until end of turn.",
    "abilities": [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: 'PLAYER_IS_CONTROLLER && (EVENT_OBJECT_MATCHES:Instant || EVENT_OBJECT_MATCHES:Sorcery)',
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    stats: { powerModifier: 1, toughnessModifier: 1 },
                    targetMapping: TargetMapping.Self
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    condition: 'SPENT_MANA_GE:5',
                    duration: { type: DurationType.UntilEndOfTurn },
                    abilitiesToAdd: ['Double Strike'],
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    "power": "2",
    "toughness": "2"
};




