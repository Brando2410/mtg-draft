import { AbilityType, CardDefinition, CostType, DynamicAmount, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';
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
                            label: "Put permanent card with mana value X or less onto battlefield tapped",
                            effects: [
                                {
                                    type: EffectType.PutOnBattlefield,
                                    tapped: true,
                                    targetDefinitions: [{
                                        type: TargetType.CardInHand,
                                        count: 1,
                                        restrictions: [
                                            Restriction.Permanent,
                                            Restriction.ManaValueLessOrEqualToX

                                        ]
                                    }]
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
    ],
    scryfall_id: "0a7f0fdf-1d4b-4458-a19c-274611e8a59a",
    image_url: "https://cards.scryfall.io/normal/front/0/a/0a7f0fdf-1d4b-4458-a19c-274611e8a59a.jpg?1775938403",
    rarity: "rare"
};

