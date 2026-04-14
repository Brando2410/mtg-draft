import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const RadiantFountain: Record<string, ImplementableCard> = {
    "Radiant Fountain": {
        name: "Radiant Fountain",
        manaCost: "",
        oracleText: "When this land enters, you gain 2 life.{T}: Add {C}.",
        colors: [],
        supertypes: [],
        types: ["Land"],
        subtypes: [],
        power: "",
        toughness: "",
        keywords: [],
        abilities: [
            {
                id: "radiant_fountain_etb",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                    eventMatch: 'ON_ETB',
                effects: [{
                    type: EffectType.GainLife,
                    amount: 2,
                    targetMapping: 'CONTROLLER'
                }]
            },
            {
                id: "radiant_fountain_mana",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Tap', value: null }],
                isManaAbility: true,
                effects: [{
                    type: EffectType.AddMana,
                    value: 'C',
                    amount: 1,
                    targetMapping: 'CONTROLLER'
                }]
            }
        ]
    }
};


