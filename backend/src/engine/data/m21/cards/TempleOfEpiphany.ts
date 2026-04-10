import { AbilityType, Zone, EffectType, ImplementableCard } from '@shared/engine_types';

export const TempleOfEpiphany: Record<string, ImplementableCard> = {
    "Temple of Epiphany": {
        name: "Temple of Epiphany",
        manaCost: "",
        oracleText: "Temple of Epiphany enters the battlefield tapped.\nWhen Temple of Epiphany enters the battlefield, scry 1.\n{T}: Add {U} or {R}.",
        colors: [],
        supertypes: [],
        types: ["Land"],
        subtypes: [],
        keywords: [],
        entersTapped: true,
        abilities: [
            {
                type: AbilityType.Triggered,
                id: "temple_of_epiphany_etb_scry",
                triggerEvent: "ON_ETB",
                activeZone: Zone.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                effects: [{ type: EffectType.Scry, amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                type: AbilityType.Activated,
                id: "temple_of_epiphany_tap_u",
                activeZone: Zone.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: '{U}' }]
            },
            {
                type: AbilityType.Activated,
                id: "temple_of_epiphany_tap_r",
                activeZone: Zone.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: '{R}' }]
            }
        ]
    }
};
