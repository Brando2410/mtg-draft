import { AbilityType, CardDefinition, CostType, EffectType, Restriction, SelectionType, TargetMapping, TargetType } from '@shared/engine_types';
export const RalZarekGuestLecturer: CardDefinition = {
    name: "Ral Zarek, Guest Lecturer",
    manaCost: "{1}{B}{B}",
    colors: ["B"],
    types: ["Legendary", "Planeswalker"],
    subtypes: ["Ral"],
    keywords: [],
    loyalty: "8",
    oracleText: "+1: Surveil 2.\n−1: Any number of target players each discard a card.\n−2: Return target creature card with mana value 3 or less from your graveyard to the battlefield.\n−7: Flip five coins. Target opponent skips their next X turns, where X is the number of coins that came up heads.",
    abilities: [
        {
            type: AbilityType.Activated,
            id: "Surveil 2",
            costs: [{ type: CostType.Loyalty, value: 1 }],
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
            id: "Any number of target players each discard a card",
            costs: [{ type: CostType.Loyalty, value: -1 }],
            targetDefinitions: [{
                type: TargetType.Player,
                count: SelectionType.ANY
            }],
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
            id: "Return target creature card with mana value 3 or less from your graveyard to the battlefield",
            costs: [{ type: CostType.Loyalty, value: -2 }],
            targetDefinitions: [{
                type: TargetType.CardInGraveyard,
                count: 1,
                restrictions: [Restriction.Creature, Restriction.ManaValue3OrLess, Restriction.YouOwn]
            }],
            effects: [
                {
                    type: EffectType.PutOnBattlefield,
                    targetMapping: TargetMapping.Target1
                }
            ]
        },
        {
            type: AbilityType.Activated,
            id: "Flip five coins: Target opponent skips their next X turns, where X is the number of coins that came up heads",
            costs: [{ type: CostType.Loyalty, value: -7 }],
            targetDefinitions: [{
                type: TargetType.Opponent,
                count: 1
            }],
            effects: [
                {
                    type: EffectType.SkipTurns,
                    flipCoins: 5,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    scryfall_id: "8fbad757-4081-42f7-a460-68ac03e77510",
    image_url: "https://cards.scryfall.io/normal/front/8/f/8fbad757-4081-42f7-a460-68ac03e77510.jpg?1775937587",
    rarity: "mythic"
};

