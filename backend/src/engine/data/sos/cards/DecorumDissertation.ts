import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const DecorumDissertation: CardDefinition = {
    name: "Decorum Dissertation",
    manaCost: "{2}{U}",
    colors: [
        "U"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Target player draws two cards. If that player is you, you may put a land card from your hand onto the battlefield.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.Player, count: 1 },
            effects: [
                { type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Target1 },
                {
                    type: CostType.Choice,
                    condition: 'TARGET_1_IS_CONTROLLER', // Wait, event for spells usually has targets.
                    label: "Put a land from hand onto battlefield?",
                    choices: [
                        {
                            label: "Yes",
                            targetDefinition: {
                                type: TargetType.CardInHand, count: 1, minCount: 0, restrictions: [
                                    "Land"
                                ]
                            },
                            effects: [{ type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.SelectedCards }]
                        },
                        { label: "No", effects: [] }
                    ]
                }
            ]
        }
    ]
};
