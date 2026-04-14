import { CardDefinition, AbilityType, EffectType, TriggerEvent, TargetMapping, DurationType } from '@shared/engine_types';

export const AberrantManawurm: CardDefinition = {
    "name": "Aberrant Manawurm",
    "manaCost": "{3}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Wurm"
    ],
    "keywords": ["Trample"],
    "oracleText": "Trample\nWhenever you cast an instant or sorcery spell, this creature gets +X/+0 until end of turn, where X is the amount of mana spent to cast that spell.",
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastInstantOrSorcery,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.Self,
                    powerModifier: 'EVENT_AMOUNT',
                    duration: DurationType.UntilEndOfTurn
                }
            ]
        }
    ],
    "power": "2",
    "toughness": "5"
};



