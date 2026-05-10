import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const RadiantFountain: CardDefinition = {
    name: "Radiant Fountain",
    manaCost: "",

    oracleText: "When this land enters, you gain 2 life.\n{T}: Add {C}.",
    colors: [],
    types: ["Land"],
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
                manaType: 'C',
                amount: 1,
                targetMapping: TargetMapping.Controller
            }]
        }
    ],
    scryfall_id: "0296c34b-120b-483e-8b49-6d432c04f9a4",
    image_url: "https://cards.scryfall.io/normal/front/0/2/0296c34b-120b-483e-8b49-6d432c04f9a4.jpg?1594737654",
    rarity: "common"
};

