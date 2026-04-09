import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const ChandraHeartofFire: Record<string, ImplementableCard> = {
    "Chandra, Heart of Fire": {
        name: "Chandra, Heart of Fire",
        manaCost: "{3}{R}{R}",
        oracleText: "+1: Discard your hand, then exile the top three cards of your library. Until end of turn, you may play cards exiled this way.\n+1: Chandra deals 2 damage to any target.\n−9: Search your graveyard and library for any number of red instant and/or sorcery cards, exile them, then shuffle. You may cast them this turn. Add six {R}.",
        colors: ["red"],
        supertypes: ["Legendary"],
        types: ["Planeswalker"],
        subtypes: ["Chandra"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "chandra_heart_fire_plus_1_a",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '+1' }],
                effects: [
                    { type: 'DiscardCards', amount: -1, targetMapping: 'CONTROLLER' },
                    { type: 'Exile', selectionType: 'TopN', sourceZone: Zone.Library, amount: 3, targetMapping: 'CONTROLLER' },
                    { type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', value: 'MAY_PLAY_EXILED', targetMapping: 'CONTROLLER' }
                ]
            },
            {
                id: "chandra_heart_fire_plus_1_b",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '+1' }],
                targetDefinition: { type: 'AnyTarget', count: 1 },
                effects: [{ type: 'DealDamage', amount: 2, targetMapping: 'TARGET_1' }]
            },
            {
                id: "chandra_heart_fire_minus_9",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '-9' }],
                effects: [
                    {
                        type: 'Choice',
                        label: 'Search Library and Graveyard for Red Instant/Sorcery cards',
                        targetIdMapping: 'CONTROLLER_GRAVEYARD_AND_LIBRARY',
                        restrictions: ['Red', 'InstantOrSorcery'],
                        maxCount: 99,
                        optional: true,
                        effects: [
                            { type: 'Exile', targetMapping: 'SELECTED' },
                            { type: 'ApplyContinuousEffect', value: 'MAY_CAST_WITHOUT_PAYING', duration: 'UNTIL_END_OF_TURN', targetMapping: 'CONTROLLER' }
                        ]
                    },
                    { type: 'Shuffle', targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    }
};
