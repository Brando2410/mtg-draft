import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping, Zone, TargetType } from '@shared/engine_types';

export const SchemingSilvertongueSigninBlood: CardDefinition = {
    "name": "Scheming Silvertongue // Sign in Blood",
    "manaCost": "{1}{B} // {B}{B}",
    "colors": ["B"],
    "types": ["Creature"],
    "subtypes": ["Vampire", "Warlock"],
    "oracleText": "Flying, lifelink\nAt the beginning of your second main phase, if you gained 2 or more life this turn, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)\n//\nSign in Blood\n{B}{B}\nSorcery\nTarget player draws two cards and loses 2 life.",
    "power": "1",
    "toughness": "3",
    "faces": [
        {
            "name": "Scheming Silvertongue",
            "manaCost": "{1}{B}",
            "colors": ["B"],
            "types": ["Creature"],
            "subtypes": ["Vampire", "Warlock"],
            "oracleText": "Flying, lifelink\nAt the beginning of your second main phase, if you gained 2 or more life this turn, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "1",
            "toughness": "3",
            "keywords": ["Flying", "Lifelink"],
            "abilities": [
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.BeginPhasePostcombatMain,
                    condition: "LIFE_GAINED_2_OR_MORE_THIS_TURN",
                    effects: [
                        {
                            type: EffectType.Prepare,
                            "targetMapping": TargetMapping.Self
                        }
                    ]
                }
            ]
        },
        {
            "name": "Sign in Blood",
            "manaCost": "{B}{B}",
            "types": ["Sorcery"],
            "colors": ["B"],
            "oracleText": "Target player draws two cards and loses 2 life.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    targetDefinition: {
                        type: TargetType.Player,
                    },
                    effects: [
                        {
                            type: EffectType.DrawCards,
                            amount: 2,
                            targetMapping: TargetMapping.Target1
                        },
                        {
                            type: EffectType.LoseLife,
                            amount: 2,
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                }
            ]
        }
    ]
};
