import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const TeferiMasterofTime: CardDefinition = {
    name: "Teferi, Master of Time",
    manaCost: "{2}{U}{U}",
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
            costs: [{ type: CostType.Loyalty, value: '+1' }],
            effects: [
                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller },
                { type: EffectType.DiscardCards, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-3' }],
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
                restrictions: ['OpponentControl']
            },
            effects: [{ type: EffectType.PhaseOut, targetMapping: TargetMapping.Target1 }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-10' }],
            effects: [{ type: EffectType.ExtraTurns, amount: 2, targetMapping: TargetMapping.Controller }]
        }
    ]
};


