import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const EliteInterceptorRejoinder: CardDefinition = {
    "name": "Elite Interceptor // Rejoinder",
    "manaCost": "{W} // {1}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Human",
        "Wizard"
    ],
    "oracleText": "Elite Interceptor (Creature): This creature enters prepared.\nRejoinder (Sorcery): You may tap or untap target creature. Draw a card.",
    "abilities": [],
    "power": "1",
    "toughness": "2",
    "faces": [
        {
            "name": "Elite Interceptor",
            "manaCost": "{W}",
            "colors": ["W"],
            "types": ["Creature"],
            "subtypes": ["Human", "Wizard"],
            "oracleText": "This creature enters prepared.",
            "entersPrepared": true,
            "power": "1",
            "toughness": "2"
        },
        {
            "name": "Rejoinder",
            "manaCost": "{1}{W}",
            "colors": ["W"],
            "types": ["Sorcery"],
            "subtypes": [],
            "oracleText": "You may tap or untap target creature.\nDraw a card.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                    effects: [
                        {
                            type: EffectType.Choice,
                            label: "Tap or untap?",
                            choices: [
                                { label: "Tap", effects: [{ type: EffectType.Tap, targetMapping: TargetMapping.Target1 }] },
                                { label: "Untap", effects: [{ type: EffectType.Untap, targetMapping: TargetMapping.Target1 }] }
                            ]
                        },
                        { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }
                    ]
                }
            ]
        }
    ]
};
