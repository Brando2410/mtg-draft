import { CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const MindintoMatter: CardDefinition = {
    "name": "Mind into Matter",
    "manaCost": "{X}{G}{U}",
    "colors": [
        "G",
        "U"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Draw X cards. Then you may put a permanent card with mana value X or less from your hand onto the battlefield tapped.",
    "abilities": [
        {
            type: 'Spell',
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 'X',
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.MoveToZone,
                    zone: 'Battlefield',
                    entersTapped: true,
                    targetDefinition: {
                        type: TargetType.CardInHand,
                        count: [0, 1],
                        restrictions: [
                            'Permanent',
                            {
                                type: 'ManaValueLe',
                                value: 'X'
                            }
                        ]
                    },
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};



