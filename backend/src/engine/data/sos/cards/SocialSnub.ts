import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const SocialSnub: CardDefinition = {
    "name": "Social Snub",
    "manaCost": "{1}{W}{B}",
    "colors": [
        "B",
        "W"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "When you cast this spell while you control a creature, you may copy this spell.\nEach player sacrifices a creature of their choice. Each opponent loses 1 life and you gain 1 life.",
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastSpell,
            condition: 'HAS_PERMANENT:creature',
            effects: [
                {
                    type: EffectType.CopySpellOnStack,
                    targetMapping: TargetMapping.Self,
                    optional: true
                }
            ]
        },
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.Sacrifice,
                    targetMapping: TargetMapping.EachPlayer,
                    restrictions: ['Creature']
                },
                {
                    type: EffectType.LoseLife,
                    amount: 1,
                    targetMapping: TargetMapping.EachOpponent
                },
                {
                    type: EffectType.GainLife,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};





