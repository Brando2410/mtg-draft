import { AbilityType, CardDefinition, CostType, EffectType } from "@shared/engine_types";

export const Island: CardDefinition = {
    name: "Island",
    manaCost: "",

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
    ],
    scryfall_id: "739aaaac-c424-4ea7-a084-62a6fc0438b0",
    image_url: "https://cards.scryfall.io/normal/front/7/3/739aaaac-c424-4ea7-a084-62a6fc0438b0.jpg?1777658399",
    rarity: "common"
};

