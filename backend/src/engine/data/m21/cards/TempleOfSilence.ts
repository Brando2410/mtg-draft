import { AbilityType, Zone, EffectType, ImplementableCard } from '@shared/engine_types';

export const TempleOfSilence: Record<string, ImplementableCard> = {
    "Temple of Silence": {
        name: "Temple of Silence",
        manaCost: "",
        oracleText: "Temple of Silence enters the battlefield tapped.\nWhen Temple of Silence enters the battlefield, scry 1.\n{T}: Add {W} or {B}.",
        colors: [],
        supertypes: [],
        types: ["Land"],
        subtypes: [],
        keywords: [],
        entersTapped: true,
        abilities: [
            {
                type: AbilityType.Triggered,
                id: "temple_of_silence_etb_scry",
                triggerEvent: "ON_ETB",
                activeZone: Zone.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                effects: [{ type: EffectType.Scry, amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                type: AbilityType.Activated,
                id: "temple_of_silence_tap_w",
                activeZone: Zone.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: '{W}' }]
            },
            {
                type: AbilityType.Activated,
                id: "temple_of_silence_tap_b",
                activeZone: Zone.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: '{B}' }]
            }
        ]
    }
};
