import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const LumaretsFavor: CardDefinition = {
    "name": "Lumaret's Favor",
    "manaCost": "{1}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Infusion — When you cast this spell, copy it if you gained life this turn. You may choose new targets for the copy.\nTarget creature gets +2/+4 until end of turn.",
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastSpell,
            condition: 'GAINED_LIFE_THIS_TURN',
            effects: [
                {
                    type: EffectType.CopySpellOnStack,
                    targetMapping: TargetMapping.Self
                }
            ]
        },
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: ["Creature"]
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 2,
                    toughnessModifier: 4,
                    duration: "UNTIL_END_OF_TURN",
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};





