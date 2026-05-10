import { AbilityType, CardDefinition, CostType, EffectType } from "@shared/engine_types";

export const Mountain: CardDefinition = {
    name: "Mountain",
    manaCost: "",

    oracleText: "({T}: Add {R}.)",
    colors: [],
    supertypes: ["Basic"],
    types: ["Land"],
    subtypes: ["Mountain"],
    abilities: [
        {
            type: AbilityType.Activated,
            id: "({T}: Add {R}.)",
            isManaAbility: true,
            costs: [{ type: CostType.Tap }],
            effects: [{ type: EffectType.AddMana, manaType: 'R' }]
        }
    ],
    scryfall_id: "51acfb01-4b0b-48fc-9704-a9b4a1e43a23",
    image_url: "https://cards.scryfall.io/normal/front/5/1/51acfb01-4b0b-48fc-9704-a9b4a1e43a23.jpg?1777658413",
    rarity: "common"
};

