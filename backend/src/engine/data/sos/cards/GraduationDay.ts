import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetType } from '@shared/engine_types';

export const GraduationDay: CardDefinition = {
    "name": "Graduation Day",
    "manaCost": "{1}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Enchantment"
    ],
    "subtypes": [],
    "oracleText": "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, put a +1/+1 counter on target creature you control.",
    "abilities": [
        {
            type: AbilityType.Triggered,
            triggerEvent: TriggerEvent.CastInstantOrSorcery,
            triggerCondition: 'EVENT_SPELL_TARGET_MATCHES:creature',
            targetDefinition: {
                type: TargetType.AnyTarget,
                count: 1,
                restrictions: ['creature', 'youcontrol']
            },
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 1,
                    value: '+1/+1',
                    targetMapping: 'TARGET_1'
                }
            ]
        }
    ]
};
