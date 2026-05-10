import { AbilityType, CardDefinition, CostType, EffectType } from "@shared/engine_types";

export const Swamp: CardDefinition = {
    name: "Swamp",
    manaCost: "",

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
    ],
    scryfall_id: "c5f590a3-9993-4ac4-a93c-1beb44eda17b",
    image_url: "https://cards.scryfall.io/normal/front/c/5/c5f590a3-9993-4ac4-a93c-1beb44eda17b.jpg?1777658405",
    rarity: "common"
};

