import { AbilityType, CardDefinition, CostType, EffectType } from "@shared/engine_types";

export const Swamp: CardDefinition = {
    name: "Swamp",
    manaCost: "",
    scryfall_id: "7880df96-f94d-45bf-8be5-60293db71691",
    image_url: "https://cards.scryfall.io/normal/front/7/8/7880df96-f94d-45bf-8be5-60293db71691.jpg?1594737785",
    oracleText: "({T}: Add {B}.)",
    colors: [],
    supertypes: ["Basic"],
    types: ["Land"],
    subtypes: ["Swamp"],
    abilities: [
        {
            type: AbilityType.Activated,
            isManaAbility: true,
            costs: [{ type: CostType.Tap }],
            effects: [{ type: EffectType.AddMana, manaType: 'B' }]
        }
    ]
};
