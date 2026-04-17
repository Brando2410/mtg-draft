import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, CostType } from "@shared/engine_types";

export const RadiantFountain: CardDefinition = {

    name: "Radiant Fountain",
    manaCost: "",
    scryfall_id: "0296c34b-120b-483e-8b49-6d432c04f9a4",
    image_url: "https://cards.scryfall.io/normal/front/0/2/0296c34b-120b-483e-8b49-6d432c04f9a4.jpg?1594737654",
    oracleText: "When this land enters, you gain 2 life.{T}: Add {C}.",
    colors: [],
    supertypes: [],
    types: ["Land"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [{
                type: EffectType.GainLife,
                amount: 2,
                targetMapping: TargetMapping.Controller
            }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
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



