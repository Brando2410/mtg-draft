import { AbilityType, Zone, CardDefinition, EffectType, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const RadiantFountain: CardDefinition = {

    name: "Radiant Fountain",
    manaCost: "",
    oracleText: "When this land enters, you gain 2 life.{T}: Add {C}.",
    colors: [],
    supertypes: [],
    types: ["Land"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            activeZone: Zone.Battlefield,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [{
                type: EffectType.GainLife,
                amount: 2,
                targetMapping: TargetMapping.Controller
            }]
        },
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [{ type: 'Tap' }],
            isManaAbility: true,
            effects: [{
                type: EffectType.AddMana,
                value: 'C',
                amount: 1,
                targetMapping: TargetMapping.Controller
            }]
        }
    ]
};



