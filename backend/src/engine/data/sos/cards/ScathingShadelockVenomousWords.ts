import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const ScathingShadelockVenomousWords: CardDefinition = {
    "name": "Scathing Shadelock // Venomous Words",
    "manaCost": "{4}{B} // {B}",
    "colors": ["B"],
    "types": ["Creature"],
    "subtypes": ["Snake", "Warlock"],
    "oracleText": "At the beginning of your first main phase, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)\n//\nVenomous Words\n{B}\nSorcery\nTarget creature you control gets +2/+0 and gains deathtouch until end of turn.",
    "power": "4",
    "toughness": "6",
    "faces": [
        {
            "name": "Scathing Shadelock",
            "manaCost": "{4}{B}",
            "colors": ["B"],
            "types": ["Creature"],
            "subtypes": ["Snake", "Warlock"],
            "oracleText": "At the beginning of your first main phase, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "4",
            "toughness": "6",
            "abilities": [
                {
                    "type": AbilityType.Triggered,
                    "eventMatch": TriggerEvent.PreCombatMainPhaseStart,
                    "condition": "OUR_TURN",
                    "effects": [
                        {
                            "type": EffectType.Prepare,
                            "targetMapping": TargetMapping.Self
                        }
                    ]
                }
            ]
        },
        {
            "name": "Venomous Words",
            "manaCost": "{B}",
            "types": ["Sorcery"],
            "oracleText": "Target creature you control gets +2/+0 and gains deathtouch until end of turn.",
            "abilities": [
                {
                    "type": AbilityType.Spell,
                    "targetDefinition": {
                        "type": "creature",
                        "controller": "you"
                    },
                    "effects": [
                        {
                            "type": EffectType.ApplyContinuousEffect,
                            "duration": "UNTIL_END_OF_TURN",
                            "powerModifier": 2,
                            "abilitiesToAdd": ["Deathtouch"],
                            "targetMapping": TargetMapping.Target1
                        }
                    ]
                }
            ]
        }
    ]
};


