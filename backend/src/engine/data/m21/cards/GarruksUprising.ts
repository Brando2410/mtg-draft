import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const GarruksUprising: Record<string, ImplementableCard> = {
    "Garruk's Uprising": {
        name: "Garruk's Uprising",
        manaCost: "{2}{G}",
        oracleText: "When this enchantment enters, if you control a creature with power 4 or greater, draw a card.\nCreatures you control have trample. (Each of those creatures can deal excess combat damage to the player or planeswalker it's attacking.)\nWhenever a creature you control with power 4 or greater enters, draw a card.",
        colors: ["green"],
        supertypes: [],
        types: ["Enchantment"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "garruk_uprising_etb_draw",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => state.battlefield.some((o: any) => o.controllerId === source.controllerId && (o.effectiveStats?.power || 0) >= 4),
                effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "garruk_uprising_trample_static",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'ApplyContinuousEffect', layer: 6, abilitiesToAdd: ['Trample'], targetMapping: 'ALL_CREATURES_YOU_CONTROL' }]
            },
            {
                id: "garruk_uprising_creature_etb_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB_OTHER',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.target.controllerId === source.controllerId && (event.target.effectiveStats?.power || 0) >= 4 && event.target.id !== source.sourceId,
                effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};
