import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const DismalBackwater: Record<string, ImplementableCard> = {
    "Dismal Backwater": {
        name: "Dismal Backwater",
        manaCost: "",
        oracleText: "This land enters tapped.\nWhen this land enters, you gain 1 life.\n{T}: Add {U} or {B}.",
        colors: [],
        supertypes: [],
        types: ["Land"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "dismal_backwater_etb_tapped",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'Tapped', value: true, targetMapping: 'SELF' }]
            },
            {
                id: "dismal_backwater_etb_life",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                effects: [{ type: 'GainLife', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};
