import { AbilityType, Zone, EffectType, ImplementableCard } from '@shared/engine_types';

export const TempleOfTriumph: Record<string, ImplementableCard> = {
    "Temple of Triumph": {
        name: "Temple of Triumph",
        manaCost: "",
        oracleText: "Temple of Triumph enters the battlefield tapped.\nWhen Temple of Triumph enters the battlefield, scry 1.\n{T}: Add {R} or {W}.",
        colors: [],
        supertypes: [],
        types: ["Land"],
        subtypes: [],
        keywords: [],
        entersTapped: true,
        abilities: [
            {
                type: AbilityType.Triggered,
                id: "temple_of_triumph_etb_scry",
                triggerEvent: "ON_ETB",
                activeZone: Zone.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                effects: [{ type: EffectType.Scry, amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                type: AbilityType.Activated,
                id: "temple_of_triumph_tap_r",
                activeZone: Zone.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: '{R}' }]
            },
            {
                type: AbilityType.Activated,
                id: "temple_of_triumph_tap_w",
                activeZone: Zone.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: '{W}' }]
            }
        ]
    }
};
