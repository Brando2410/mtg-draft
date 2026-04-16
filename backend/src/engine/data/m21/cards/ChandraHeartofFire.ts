import { AbilityType, ZoneRequirement, EffectType, TargetType, TargetMapping, CardDefinition, DurationType, Zone } from '@shared/engine_types';

export const ChandraHeartofFire: CardDefinition = {

    name: "Chandra, Heart of Fire",
    manaCost: "{3}{R}{R}",
    oracleText: "+1: Discard your hand, then exile the top three cards of your library. Until end of turn, you may play cards exiled this way.\n+1: Chandra deals 2 damage to any target.\n−9: Search your graveyard and library for any number of red instant and/or sorcery cards, exile them, then shuffle. You may cast them this turn. Add six {R}.",
    colors: ["R"],
    supertypes: ["Legendary"],
    types: ["Planeswalker"],
    subtypes: ["Chandra"],
    keywords: [],
    loyalty: "5",
    abilities: [
        {
            id: "chandra_heart_fire_plus_1_a",
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Loyalty', value: '+1' }],
            effects: [
                { type: EffectType.DiscardCards, amount: -1, targetMapping: TargetMapping.Controller },
                { type: EffectType.Exile, selectionType: 'TopN', sourceZone: Zone.Library, amount: 3, targetMapping: TargetMapping.Controller },
                { type: EffectType.ApplyContinuousEffect, duration: DurationType.UntilEndOfTurn, value: 'MAY_PLAY_EXILED', targetMapping: TargetMapping.Controller }
            ]
        },
        {
            id: "chandra_heart_fire_plus_1_b",
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Loyalty', value: '+1' }],
            targetDefinition: { type: TargetType.AnyTarget, count: 1 },
            effects: [{ type: EffectType.DealDamage, amount: 2, targetMapping: TargetMapping.Target1 }]
        },
        {
            id: "chandra_heart_fire_minus_9",
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Loyalty', value: '-9' }],
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    label: 'Search Library and Graveyard for Red Instant/Sorcery cards',
                    targetIdMapping: 'CONTROLLER_GRAVEYARD_AND_LIBRARY',
                    restrictions: ['Red', 'InstantOrSorcery'],
                    maxCount: 99,
                    optional: true,
                    effects: [
                        { type: EffectType.Exile, targetMapping: 'SELECTED' },
                        { type: EffectType.ApplyContinuousEffect, value: 'MAY_CAST_WITHOUT_PAYING', duration: DurationType.UntilEndOfTurn, targetMapping: TargetMapping.Controller }
                    ]
                },
                { type: EffectType.Shuffle, targetMapping: TargetMapping.Controller }
            ]
        }
    ]

};
