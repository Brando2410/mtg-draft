import { CardDefinition, AbilityType, EffectType, TriggerEvent, TargetMapping, DurationType } from '@shared/engine_types';

export const InklingMascot: CardDefinition = {
    "name": "Inkling Mascot",
    "manaCost": "{W}{B}",
    "colors": [
        "B",
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Inkling",
        "Cat"
    ],
    "oracleText": "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, this creature gains flying until end of turn. Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
    "abilities": [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: 'REPARTEE_TRIGGER',
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    abilitiesToAdd: ['Flying'],
                    duration: DurationType.UntilEndOfTurn,
                    targetMapping: TargetMapping.Self
                },
                {
                    type: EffectType.Surveil,
                    amount: 1
                }
            ]
        }
    ],
    "power": "2",
    "toughness": "2"
};

