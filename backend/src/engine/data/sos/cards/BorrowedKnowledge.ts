import { CardDefinition, AbilityType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const BorrowedKnowledge: CardDefinition = {
    "name": "Borrowed Knowledge",
    "manaCost": "{2}{R}{W}",
    "colors": [
        "R",
        "W"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Choose one —\n• Discard your hand, then draw cards equal to the number of cards in target opponent's hand.\n• Discard your hand, then draw cards equal to the number of cards discarded this way.",
    "abilities": [
        {
            type: AbilityType.Spell,
            isModal: true,
            modes: [
                {
                    label: "Discard hand, draw cards equal to opponent's hand size",
                    targetDefinition: { type: TargetType.Player, count: 1, restrictions: ['Opponent'] },
                    effects: [
                        { type: EffectType.DiscardCards, amount: 'ALL', targetMapping: TargetMapping.Controller },
                        { type: EffectType.DrawCards, amount: 'TARGET_1_HAND_SIZE', targetMapping: TargetMapping.Controller }
                    ]
                },
                {
                    label: "Discard hand, draw cards equal to discarded count",
                    effects: [
                        { type: EffectType.DiscardCards, amount: 'ALL', targetMapping: TargetMapping.Controller },
                        { type: EffectType.DrawCards, amount: 'DISCARDED_COUNT', targetMapping: TargetMapping.Controller }
                    ]
                }
            ]
        }
    ]
};
