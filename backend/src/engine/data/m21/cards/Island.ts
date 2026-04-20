import { AbilityType, CardDefinition, CostType, EffectType } from "@shared/engine_types";

export const Island: CardDefinition = {
    name: "Island",
    manaCost: "",
    scryfall_id: "fc9a66a1-367c-4035-a22e-00fab55be5a0",
    image_url: "https://cards.scryfall.io/normal/front/f/c/fc9a66a1-367c-4035-a22e-00fab55be5a0.jpg?1594737796",
    oracleText: "({T}: Add {U}.)",
    colors: [],
    supertypes: ["Basic"],
    types: ["Land"],
    subtypes: ["Island"],
    abilities: [
        {
            type: AbilityType.Activated,
            isManaAbility: true,
            costs: [{ type: CostType.Tap }],
            effects: [{ type: EffectType.AddMana, manaType: 'U' }]
        }
    ]
};
