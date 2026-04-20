import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const TeferiMasterofTime: CardDefinition = {
    name: "Teferi, Master of Time",
    manaCost: "{2}{U}{U}",
    scryfall_id: "9c0c61e3-9f3d-4e7f-904f-0eaa381e8ea1",
    image_url: "https://cards.scryfall.io/normal/front/9/c/9c0c61e3-9f3d-4e7f-904f-0eaa381e8ea1.jpg?1594735803",
    oracleText: "You may activate loyalty abilities of Teferi, Master of Time on any player's turn any time you could cast an instant.\n+1: Draw a card, then discard a card.\n−3: Target creature an opponent controls phases out.\n−10: Take two extra turns after this one.",
    colors: ["U"],
    supertypes: ["Legendary"],
    types: ["Planeswalker"],
    subtypes: ["Teferi"],
    loyalty: "3",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{ type: EffectType.AllowOutOfTurnActivation, targetMapping: TargetMapping.Self }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: 1 }],
            effects: [
                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller },
                { type: EffectType.DiscardCards, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: -3 }],
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
                restrictions: [Restriction.OpponentControl]
            },
            effects: [{ type: EffectType.PhaseOut, targetMapping: TargetMapping.Target1 }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: -10 }],
            effects: [{ type: EffectType.ExtraTurns, amount: 2, targetMapping: TargetMapping.Controller }]
        }
    ]
};
