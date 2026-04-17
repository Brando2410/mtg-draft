import { AbilityType, CardDefinition, CostType, DynamicAmount, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const MindintoMatter: CardDefinition = {
    name: "Mind into Matter",
    manaCost: "{X}{G}{U}",
    colors: [
        "G",
        "U"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Draw X cards. Then you may put a permanent card with mana value X or less from your hand onto the battlefield tapped.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: DynamicAmount.X,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: CostType.Choice,
                    label: "Put a permanent card from hand onto battlefield?",
                    optional: true,
                    targetMapping: TargetMapping.Controller,
                    choices: [
                        {
                            label: "Put card with mana value X or less onto battlefield tapped",
                            effects: [
                                {
                                    type: EffectType.PutOnBattlefield,
                                    tapped: true,
                                    targetDefinition: {
                                        type: TargetType.CardInHand,
                                        count: 1,
                                        restrictions: [
                { type: 'Type', value: 'Permanent' },
                {
                                                type: 'ManaValueLe',
                value: DynamicAmount.X
                                            }
            ]
                                    },
                                }
                            ]
                        },
                        {
                            label: "Decline",
                            effects: []
                        }
                    ]
                }
            ]
        }
    ]
};
    