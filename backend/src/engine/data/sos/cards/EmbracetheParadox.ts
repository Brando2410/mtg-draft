import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';
    export const EmbracetheParadox: CardDefinition = {
    name: "Embrace the Paradox",
    manaCost: "{3}{G}{U}",
    colors: [
        "G",
        "U"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Draw three cards. You may put a land card from your hand onto the battlefield tapped.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 3
                },
                {
                    type: CostType.Choice,
                    label: 'Put a land card from hand onto battlefield tapped?',
                    optional: true,
                    choices: [
                        {
                            label: 'Yes',
                            targetDefinition: {
                                type: TargetType.Card,
                                zone: Zone.Hand,
                                count: 1,
                                restrictions: [
                { type: 'Type', value: 'Land' }
            ]
                            },
                            effects: [
                                {
                                    type: EffectType.PutOnBattlefield,
                                    targetMapping: TargetMapping.Target1,
                                    tapped: true
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
    