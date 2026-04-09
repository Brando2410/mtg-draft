import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const BloodfellCaves: Record<string, ImplementableCard> = {
    "Bloodfell Caves": {
        name: "Bloodfell Caves",
        manaCost: "",
        oracleText: "This land enters tapped.\nWhen this land enters, you gain 1 life.\n{T}: Add {B} or {R}.",
        colors: [],
        supertypes: [],
        types: ["Land"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "bloodfell_caves_etb_tapped",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'Tapped', targetMapping: 'SELF' }]
            },
            {
                id: "bloodfell_caves_etb_life",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: 'OBJECT_IS_SELF',
                effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};
