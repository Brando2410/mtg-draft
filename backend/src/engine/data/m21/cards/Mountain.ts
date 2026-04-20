import { AbilityType, CardDefinition, CostType, EffectType } from "@shared/engine_types";

export const Mountain: CardDefinition = {
    name: "Mountain",
    manaCost: "",
    scryfall_id: "b92c8925-ecfc-4ece-b83a-f12e98a938ab",
    image_url: "https://cards.scryfall.io/normal/front/b/9/b92c8925-ecfc-4ece-b83a-f12e98a938ab.jpg?1594737848",
    oracleText: "({T}: Add {R}.)",
    colors: [],
    supertypes: ["Basic"],
    types: ["Land"],
    subtypes: ["Mountain"],
    abilities: [
        {
            type: AbilityType.Activated,
            isManaAbility: true,
            costs: [{ type: CostType.Tap }],
            effects: [{ type: EffectType.AddMana, manaType: 'R' }]
        }
    ]
};
