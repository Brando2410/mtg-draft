import { AbilityType, CardDefinition, CostType, EffectType } from "@shared/engine_types";

export const Plains: CardDefinition = {

    name: "Plains",
    manaCost: "",
    oracleText: "({T}: Add {W}.)",
    colors: [],
    supertypes: ["Basic"],
    types: ["Land"],
    subtypes: ["Plains"],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Activated,
            isManaAbility: true,
            costs: [{ type: CostType.Tap }],
            effects: [{ type: EffectType.AddMana, value: 'W' }]
        }
    ]
};
