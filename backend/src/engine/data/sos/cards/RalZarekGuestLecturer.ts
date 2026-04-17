import { AbilityType, CardDefinition, CostType, EffectType, Restriction, SelectionType, TargetMapping, TargetType } from '@shared/engine_types';
export const RalZarekGuestLecturer: CardDefinition = {
    name: "Ral Zarek, Guest Lecturer",
    manaCost: "{1}{B}{B}",
    colors: ["B"],
    types: ["Legendary", "Planeswalker"],
    subtypes: ["Ral"],
    keywords: [],
    loyalty: "3",
    oracleText: "+1: Surveil 2.\n−1: Any number of target players each discard a card.\n−2: Return target creature card with mana value 3 or less from your graveyard to the battlefield.\n−7: Flip five coins. Target opponent skips their next X turns, where X is the number of coins that came up heads.",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '+1' }],
            effects: [
                {
                    type: EffectType.Surveil,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-1' }],
            targetDefinition: {
                type: TargetType.Player,
                count: SelectionType.AnyNumber
            },
            effects: [
                {
                    type: EffectType.DiscardCards,
                    amount: 1,
                    targetMapping: TargetMapping.TargetAll
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-2' }],
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 1,
                restrictions: [Restriction.Creature, "mv <= 3"]
            },
            effects: [
                {
                    type: EffectType.PutOnBattlefield,
                    targetMapping: TargetMapping.Target1
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-7' }],
            targetDefinition: {
                type: TargetType.Opponent,
                count: 1
            },
            effects: [
                {
                    type: EffectType.SkipTurns,
                    flipCoins: 5,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
