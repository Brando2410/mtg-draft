import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const SplatterTechnique: CardDefinition = {
    "name": "Splatter Technique",
    "manaCost": "{1}{U}{U}{R}{R}",
    "colors": [
        "R",
        "U"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Choose one —\n• Draw four cards.\n• Splatter Technique deals 4 damage to each creature and planeswalker.",
    "abilities": [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Choose one",
                    choices: [
                        {
                            label: "Draw four cards",
                            effects: [
                                {
                                    type: EffectType.DrawCards,
                                    amount: 4,
                                    targetMapping: TargetMapping.Controller
                                }
                            ]
                        },
                        {
                            label: "Deal 4 damage to each creature and planeswalker",
                            effects: [
                                {
                                    type: EffectType.DealDamage,
                                    amount: 4,
                                    targetMapping: TargetMapping.AllCreaturesAndPlaneswalkers
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};



