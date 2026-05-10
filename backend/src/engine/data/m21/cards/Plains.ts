import { AbilityType, CardDefinition, CostType, EffectType } from "@shared/engine_types";

export const Plains: CardDefinition = {
    name: "Plains",
    manaCost: "",

    oracleText: "({T}: Add {W}.)",
    colors: [],
    supertypes: ["Basic"],
    types: ["Land"],
    subtypes: ["Plains"],
    abilities: [
        {
            type: AbilityType.Activated,
            isManaAbility: true,
            costs: [{ type: CostType.Tap }],
            effects: [{ type: EffectType.AddMana, manaType: 'W' }]
        }
    ],
    scryfall_id: "24dc369c-020a-4115-a4bb-d60a44de64e3",
    image_url: "https://cards.scryfall.io/normal/front/2/4/24dc369c-020a-4115-a4bb-d60a44de64e3.jpg?1777658393",
    rarity: "common"
};

