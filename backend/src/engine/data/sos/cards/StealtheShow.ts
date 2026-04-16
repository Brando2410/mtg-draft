import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const StealtheShow: CardDefinition = {
    "name": "Steal the Show",
    "manaCost": "{2}{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Choose one or both —\n• Target player discards any number of cards, then draws that many cards.\n• Steal the Show deals damage equal to the number of instant and sorcery cards in your graveyard to target creature or planeswalker.",
    "abilities": [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.Choice,
                    minChoices: 1,
                    maxChoices: 2,
                    choices: [
                        {
                            label: "Target player discards any number, then draws that many cards.",
                            targetDefinition: {
                                type: TargetType.Player,
                                count: 1
                            },
                            effects: [
                                {
                                    type: EffectType.DiscardCards,
                                    amount: 'ANY',
                                    targetMapping: TargetMapping.Target1
                                },
                                {
                                    type: EffectType.DrawCards,
                                    amount: 'DISCARDED_COUNT',
                                    targetMapping: TargetMapping.Target1
                                }
                            ]
                        },
                        {
                            label: "Steal the Show deals damage equal to instant/sorcery in your graveyard to target creature or planeswalker.",
                            targetDefinition: {
                                type: TargetType.Permanent,
                                count: 1,
                                restrictions: [
                                    { type: 'Type', value: 'Creature' },
                                    { type: 'Type', value: 'Planeswalker', isOr: true }
                                ]
                            },
                            effects: [
                                {
                                    type: EffectType.DealDamage,
                                    amount: 'INSTANT_SORCERY_IN_GRAVEYARD_COUNT',
                                    targetMapping: TargetMapping.Target1
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};



