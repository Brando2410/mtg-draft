import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const SanctumofAll: Record<string, ImplementableCard> = {
    "Sanctum of All": {
        name: "Sanctum of All",
        manaCost: "{W}{U}{B}{R}{G}",
        oracleText: "At the beginning of your upkeep, you may search your library and/or graveyard for a Shrine card and put it onto the battlefield. If you search your library this way, shuffle.\nIf an ability of a Shrine you control triggers, if you control five or more Shrines, that ability triggers an additional time.",
        colors: ["white","blue","black","red","green"],
        supertypes: ["Legendary"],
        types: ["Enchantment"],
        subtypes: ["Shrine"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "sanctum_all_etb",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                effects: [{ type: 'SearchLibrary', value: 'Shrine', targetMapping: 'CONTROLLER' }, { type: 'PutOnBattlefield', targetMapping: 'TARGET_1' }]
            },
            {
                id: "sanctum_all_trigger_double",
                type: AbilityType.Replacement,
                activeZone: ZoneRequirement.Battlefield,
                replacesEvent: 'ON_SHRINE_TRIGGER',
                triggerCondition: (state: any) => state.battlefield.filter((o: any) => o.definition.subtypes.includes('Shrine')).length >= 5,
                effects: [{ type: 'AddAdditionalTrigger', targetMapping: 'TRIGGER_SOURCE' }]
            }
        ]
    }
};
