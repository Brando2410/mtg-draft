import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping } from '@shared/engine_types';

export const LecturingScornmage: CardDefinition = {
    "name": "Lecturing Scornmage",
    "manaCost": "{B}",
    "colors": [
        "B"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Human",
        "Warlock"
    ],
    "oracleText": "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, put a +1/+1 counter on this creature.",
    "keywords": ["Repartee"],
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastSpell,
            condition: 'REPARTEE_TRIGGER',
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: 'p1p1',
                    amount: 1,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    "power": "1",
    "toughness": "1"
};





