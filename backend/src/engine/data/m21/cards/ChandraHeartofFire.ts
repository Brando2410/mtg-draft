import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const ChandraHeartofFire: CardDefinition = {
    name: "Chandra, Heart of Fire",
    manaCost: "{3}{R}{R}",
    scryfall_id: "a4c3ca8c-c77c-43b8-84ad-796313ecc813",
    image_url: "https://cards.scryfall.io/normal/front/a/4/a4c3ca8c-c77c-43b8-84ad-796313ecc813.jpg?1594752360",
    oracleText: "+1: Discard your hand, then exile the top three cards of your library. Until end of turn, you may play cards exiled this way.\n+1: Chandra deals 2 damage to any target.\n−9: Search your graveyard and library for any number of red instant and/or sorcery cards, exile them, then shuffle. You may cast them this turn. Add six {R}.",
    colors: ["R"],
    supertypes: ["Legendary"],
    types: ["Planeswalker"],
    subtypes: ["Chandra"],
    loyalty: "5",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '+1' }],
            effects: [
                { type: EffectType.DiscardCards, amount: -1, targetMapping: TargetMapping.Controller },
                {
                    type: EffectType.Exile,
                    selectionType: 'TopN',
                    sourceZone: Zone.Library,
                    amount: 3,
                    targetMapping: TargetMapping.Controller,
                    applyToExiled: { type: EffectType.AllowPlayExiled, duration: { type: DurationType.UntilEndOfTurn } }
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '+1' }],
            targetDefinition: { type: TargetType.AnyTarget, count: 1 },
            effects: [{ type: EffectType.DealDamage, amount: 2, targetMapping: TargetMapping.Target1 }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-9' }],
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    label: 'Search Library and Graveyard for Red Instant/Sorcery cards',
                    targetIdMapping: 'CONTROLLER_GRAVEYARD_AND_LIBRARY',
                    restrictions: [
                { type: 'Type', value: 'Red' },
                { type: 'Type', value: 'InstantOrSorcery' }
            ],
                    maxCount: 99,
                    optional: true,
                    effects: [
                        { type: EffectType.Exile, targetMapping: TargetMapping.SelectedCard },
                        {
                            type: EffectType.ApplyContinuousEffect,
                            value: 'MAY_CAST_WITHOUT_PAYING',
                            duration: { type: DurationType.UntilEndOfTurn },
                            targetMapping: TargetMapping.SelectedCard
                        }
                    ]
                },
                { type: EffectType.Shuffle, targetMapping: TargetMapping.Controller },
                { type: EffectType.AddMana, value: "{R}{R}{R}{R}{R}{R}", targetMapping: TargetMapping.Controller }
            ]
        }
    ]
};


