import { CardDefinition, AbilityType, EffectType, TargetType, TargetMapping } from '@shared/engine_types';

export const GloriousDecay: CardDefinition = {
    "name": "Glorious Decay",
    "manaCost": "{1}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Choose one —\n• Destroy target artifact.\n• Glorious Decay deals 4 damage to target creature with flying.\n• Exile target card from a graveyard. Draw a card.",
    "abilities": [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Choose a mode",
                    choices: [
                        {
                            label: "Destroy target artifact",
                            targetDefinition: {
                                type: TargetType.Permanent,
                                count: 1,
                                restrictions: ["Artifact"]
                            },
                            effects: [
                                {
                                    type: EffectType.Destroy,
                                    targetMapping: TargetMapping.Target1
                                }
                            ]
                        },
                        {
                            label: "Deals 4 damage to target creature with flying",
                            targetDefinition: {
                                type: TargetType.Permanent,
                                count: 1,
                                restrictions: ["Creature", "Flying"]
                            },
                            effects: [
                                {
                                    type: 'DealDamage' as any,
                                    amount: 4,
                                    targetMapping: TargetMapping.Target1
                                }
                            ]
                        },
                        {
                            label: "Exile target card from a graveyard. Draw a card",
                            targetDefinition: {
                                type: TargetType.CardInGraveyard,
                                count: 1
                            },
                            effects: [
                                {
                                    type: EffectType.Exile,
                                    targetMapping: TargetMapping.Target1
                                },
                                {
                                    type: EffectType.DrawCards,
                                    targetMapping: TargetMapping.Controller,
                                    amount: 1
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
