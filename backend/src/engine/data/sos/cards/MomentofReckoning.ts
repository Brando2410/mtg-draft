import { CardDefinition, AbilityType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const MomentofReckoning: CardDefinition = {
    "name": "Moment of Reckoning",
    "manaCost": "{3}{W}{W}{B}{B}",
    "colors": [
        "B",
        "W"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Choose up to four. You may choose the same mode more than once.\n• Destroy target nonland permanent.\n• Return target nonland permanent card from your graveyard to the battlefield.",
    "abilities": [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.Choice,
                    minChoices: 1,
                    maxChoices: 4,
                    choices: [
                        {
                            label: "Destroy target nonland permanent (Slot 1)",
                            targetDefinition: { type: TargetType.Permanent, count: 1, restrictions: ['NonLand'] },
                            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
                        },
                        {
                            label: "Destroy target nonland permanent (Slot 2)",
                            targetDefinition: { type: TargetType.Permanent, count: 1, restrictions: ['NonLand'] },
                            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target2 }]
                        },
                        {
                            label: "Destroy target nonland permanent (Slot 3)",
                            targetDefinition: { type: TargetType.Permanent, count: 1, restrictions: ['NonLand'] },
                            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target3 }]
                        },
                        {
                            label: "Destroy target nonland permanent (Slot 4)",
                            targetDefinition: { type: TargetType.Permanent, count: 1, restrictions: ['NonLand'] },
                            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target4 }]
                        },
                        {
                            label: "Return target nonland permanent card (Slot 1)",
                            targetDefinition: { type: TargetType.CardInGraveyard, count: 1, restrictions: ['NonLand', 'Permanent'] },
                            effects: [{ type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.Target5 }]
                        },
                        {
                            label: "Return target nonland permanent card (Slot 2)",
                            targetDefinition: { type: TargetType.CardInGraveyard, count: 1, restrictions: ['NonLand', 'Permanent'] },
                            effects: [{ type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.Target6 }]
                        },
                        {
                            label: "Return target nonland permanent card (Slot 3)",
                            targetDefinition: { type: TargetType.CardInGraveyard, count: 1, restrictions: ['NonLand', 'Permanent'] },
                            effects: [{ type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.Target7 }]
                        },
                        {
                            label: "Return target nonland permanent card (Slot 4)",
                            targetDefinition: { type: TargetType.CardInGraveyard, count: 1, restrictions: ['NonLand', 'Permanent'] },
                            effects: [{ type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.Target8 }]
                        }
                    ]
                }
            ]
        }
    ]
};



