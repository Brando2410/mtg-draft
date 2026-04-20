import { AbilityType, CardDefinition, EffectType } from "@shared/engine_types";

export const Forest: CardDefinition = {
    name: "Forest",
    manaCost: "",
    scryfall_id: "3279314f-d639-4489-b2ab-3621bb3ca64b",
    image_url: "https://cards.scryfall.io/normal/front/3/2/3279314f-d639-4489-b2ab-3621bb3ca64b.jpg?1594737877",
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
    ]
};
