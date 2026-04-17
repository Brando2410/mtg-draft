import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const UgintheSpiritDragon: CardDefinition = {
    name: "Ugin, the Spirit Dragon",
    manaCost: "{8}",
    oracleText: "+2: Ugin, the Spirit Dragon deals 3 damage to any target.\n−X: Exile each permanent with mana value X or less that's one or more colors.\n−10: You gain 7 life, draw seven cards, then put up to seven permanent cards from your hand onto the battlefield.",
    colors: [],
    supertypes: ["Legendary"],
    types: ["Planeswalker"],
    subtypes: ["Ugin"],
    loyalty: "7",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '+2' }],
            targetDefinition: {
                type: TargetType.AnyTarget,
                count: 1
            },
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 3,
                    targetMapping: TargetMapping.Target1
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-X' }],
            effects: [
                {
                    type: EffectType.Exile,
                    targetMapping: TargetMapping.AllMatchingPermanents,
                    restrictions: [
                { type: 'Type', value: 'oneormorecolors' },
                { type: 'Type', value: 'mv_le_x' }
            ]
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-10' }],
            effects: [
                {
                    type: EffectType.GainLife,
                    amount: 7,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.DrawCards,
                    amount: 7,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.Choice,
                    label: "Put up to seven permanent cards from your hand onto the battlefield.",
                    optional: true,
                    targetDefinition: {
                        type: TargetType.CardInHand,
                        count: 7,
                        restrictions: [
                { type: 'Type', value: 'Permanent' }
            ],
                        minCount: 0
                    },
                    effects: [
                        { type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.SelectedTargets }
                    ]
                }
            ]
        }
    ]
};



