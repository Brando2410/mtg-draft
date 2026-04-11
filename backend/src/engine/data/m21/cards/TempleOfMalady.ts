import { AbilityType, Zone, EffectType, ImplementableCard, ZoneRequirement } from '@shared/engine_types';

export const TempleOfMalady: Record<string, ImplementableCard> = {
    "Temple of Malady": {
        name: "Temple of Malady",
        manaCost: "",
        oracleText: "Temple of Malady enters the battlefield tapped.\nWhen Temple of Malady enters the battlefield, scry 1.\n{T}: Add {B} or {G}.",
        colors: [],
        supertypes: [],
        types: ["Land"],
        subtypes: [],
        keywords: [],
        entersTapped: true,
        abilities: [
            {
                type: AbilityType.Triggered,
                id: "temple_of_malady_etb_scry",
                triggerEvent: "ON_ETB",
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                effects: [{ type: EffectType.Scry, amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                type: AbilityType.Activated,
                id: "temple_of_malady_tap_b",
                activeZone: Zone.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: '{B}' }]
            },
            {
                type: AbilityType.Activated,
                id: "temple_of_malady_tap_g",
                activeZone: Zone.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: '{G}' }]
            }
        ]
    }
};
