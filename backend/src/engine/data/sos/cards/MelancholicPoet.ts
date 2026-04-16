import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const MelancholicPoet: CardDefinition = {
    "name": "Melancholic Poet",
    "manaCost": "{1}{B}",
    "colors": [
        "B"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Elf",
        "Bard"
    ],
    "oracleText": "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, each opponent loses 1 life and you gain 1 life.",
    "keywords": ["Repartee"],
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastSpell,
            condition: 'REPARTEE_TRIGGER',
            effects: [
                {
                    type: EffectType.LoseLife,
                    amount: 1,
                    targetMapping: TargetMapping.EachOpponent
                },
                {
                    type: EffectType.GainLife,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    "power": "2",
    "toughness": "2"
};






