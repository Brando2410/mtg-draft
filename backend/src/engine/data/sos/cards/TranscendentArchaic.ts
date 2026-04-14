import { AbilityType, CardDefinition, EffectType, TriggerEvent, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const TranscendentArchaic: CardDefinition = {
    "name": "Transcendent Archaic",
    "manaCost": "{7}",
    "colors": [],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Avatar"
    ],
    "oracleText": "Vigilance\nConverge — When this creature enters, you may draw X cards, where X is the number of colors of mana spent to cast this spell. If you draw one or more cards this way, discard two cards.",
    "keywords": ["Vigilance"],
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Draw cards based on Converge?",
                    choices: [
                        {
                            label: "Yes",
                            effects: [
                                {
                                    type: EffectType.DrawCards,
                                    amount: DynamicAmount.ConvergeAmount,
                                    targetMapping: TargetMapping.Controller
                                },
                                {
                                    type: EffectType.ConditionalEffect,
                                    condition: 'DRAWN_CARDS_GE:1',
                                    effects: [
                                        {
                                            type: EffectType.DiscardCards,
                                            amount: 2,
                                            targetMapping: TargetMapping.Controller
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            label: "No",
                            effects: []
                        }
                    ]
                }
            ]
        }
    ],
    "power": "6",
    "toughness": "6"
};



