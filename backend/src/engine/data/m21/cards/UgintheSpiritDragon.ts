import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const UgintheSpiritDragon: CardDefinition = {
    name: "Ugin, the Spirit Dragon",
    manaCost: "{8}",
    scryfall_id: "9c017fa9-7021-417a-9c2e-3df409644fcf",
    image_url: "https://cards.scryfall.io/normal/front/9/c/9c017fa9-7021-417a-9c2e-3df409644fcf.jpg?1594734662",
    oracleText: "+2: Ugin, the Spirit Dragon deals 3 damage to any target.\n−X: Exile each permanent with mana value X or less that's one or more colors.\n−10: You gain 7 life, draw seven cards, then put up to seven permanent cards from your hand onto the battlefield.",
    colors: [],
    supertypes: ["Legendary"],
    types: ["Planeswalker"],
    subtypes: ["Ugin"],
    loyalty: "7",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: 2 }],
            targetDefinitions: [{ type: TargetType.AnyTarget, count: 1 }],
            effects: [{ type: EffectType.DealDamage, amount: 3, targetMapping: TargetMapping.Target1 }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: -999 }], // -X
            effects: [
                {
                    type: EffectType.Exile,
                    targetMapping: TargetMapping.AllMatchingPermanents,
                    restrictions: [
                        Restriction.OneOrMoreColors,
                        Restriction.ManaValueLessOrEqualToX
                    ]
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: -10 }],
            effects: [
                { type: EffectType.GainLife, amount: 7, targetMapping: TargetMapping.Controller },
                { type: EffectType.DrawCards, amount: 7, targetMapping: TargetMapping.Controller },
                {
                    type: EffectType.Choice,
                    label: "Put up to seven permanent cards from your hand onto the battlefield.",
                    optional: true,
                    targetDefinitions: [{
                        type: TargetType.CardInHand,
                        count: 7,
                        minCount: 0,
                        restrictions: [Restriction.Permanent]
                    }],
                    effects: [{
                        type: EffectType.PutOnBattlefield,
                        targetMapping: TargetMapping.SelectedTargets
                    }]
                }
            ]
        }
    ]
};
