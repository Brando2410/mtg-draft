import { AbilityType, CardDefinition, CostType, DurationType, DynamicAmount, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const ChandraFlamesCatalyst: CardDefinition = {
    name: "Chandra, Flame's Catalyst",
    manaCost: "{4}{R}{R}",
    scryfall_id: "1e49ce44-5286-4310-88c2-f8a1402b113b",
    image_url: "https://cards.scryfall.io/normal/front/1/e/1e49ce44-5286-4310-88c2-f8a1402b113b.jpg?1596168039",
    oracleText: "+1: Chandra deals 3 damage to each opponent.\n−2: You may cast target red instant or sorcery card from your graveyard this turn without paying its mana cost. If that spell would be put into your graveyard this turn, exile it instead.\n−8: Discard your hand, then draw seven cards. Until end of turn, you may cast spells from your hand without paying their mana costs.",
    colors: ["R"],
    supertypes: ["Legendary"],
    types: ["Planeswalker"],
    subtypes: ["Chandra"],
    loyalty: "5",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '+1' }],
            effects: [{
                type: EffectType.DealDamage,
                amount: 3,
                targetMapping: TargetMapping.EachOpponent
            }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-2' }],
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 1,
                restrictions: [
                    Restriction.Red,
                    Restriction.InstantOrSorcery
                ]
            },
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                isFreeCast: true,
                allowCastFromZone: Zone.Graveyard,
                exileOnMoveToGraveyard: true,
                targetMapping: TargetMapping.Target1
            }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-8' }],
            effects: [
                { type: EffectType.DiscardCards, amount: DynamicAmount.HandCount, targetMapping: TargetMapping.Controller },
                { type: EffectType.DrawCards, amount: 7, targetMapping: TargetMapping.Controller },
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    allowFreeCastFromHand: true,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
