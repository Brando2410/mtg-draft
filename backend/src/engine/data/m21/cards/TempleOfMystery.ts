import { AbilityType, Zone, EffectType, ImplementableCard } from '@shared/engine_types';

export const TempleOfMystery: Record<string, ImplementableCard> = {
    "Temple of Mystery": {
        name: "Temple of Mystery",
        manaCost: "",
        oracleText: "Temple of Mystery enters the battlefield tapped.\nWhen Temple of Mystery enters the battlefield, scry 1.\n{T}: Add {G} or {U}.",
        colors: [],
        supertypes: [],
        types: ["Land"],
        subtypes: [],
        keywords: [],
        entersTapped: true,
        abilities: [
            {
                type: AbilityType.Triggered,
                id: "temple_of_mystery_etb_scry",
                triggerEvent: "ON_ETB",
                activeZone: Zone.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                effects: [{ type: EffectType.Scry, amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                type: AbilityType.Activated,
                id: "temple_of_mystery_tap_g",
                activeZone: Zone.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: '{G}' }]
            },
            {
                type: AbilityType.Activated,
                id: "temple_of_mystery_tap_u",
                activeZone: Zone.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: '{U}' }]
            }
        ]
    }
};
