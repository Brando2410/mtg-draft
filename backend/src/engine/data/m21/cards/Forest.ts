import { AbilityType, CardDefinition, EffectType } from "@shared/engine_types";

export const Forest: CardDefinition = {
    name: "Forest",
    manaCost: "",

    oracleText: "({T}: Add {G}.)",
    colors: [],
    supertypes: ["Basic"],
    types: ["Land"],
    subtypes: ["Forest"],
    abilities: [
        {
            type: AbilityType.Activated,
            isManaAbility: true,
            costs: [{ type: 'Tap' }],
            effects: [{ type: EffectType.AddMana, manaType: 'G' }]
        }
    ],
    scryfall_id: "5f533364-0f91-4e49-aaeb-83c4c1f6d316",
    image_url: "https://cards.scryfall.io/normal/front/5/f/5f533364-0f91-4e49-aaeb-83c4c1f6d316.jpg?1777658419",
    rarity: "common"
};

