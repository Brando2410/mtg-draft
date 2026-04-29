import { AbilityType, CardDefinition, CostType, EffectType } from '@shared/engine_types';

export const Swamp: CardDefinition = {
    name: "Swamp",
    manaCost: "",
    scryfall_id: "62bb1e28-8742-49aa-92f7-02f82ba696cd",
    image_url: "https://cards.scryfall.io/normal/front/6/2/62bb1e28-8742-49aa-92f7-02f82ba696cd.jpg?1594737835",
    colors: [],
    supertypes: ["Basic"],
    types: ["Land"],
    subtypes: ["Swamp"],
    keywords: [],
    oracleText: "({T}: Add {B}.)",
    abilities: [
        {
            type: AbilityType.Activated,
            isManaAbility: true,
            costs: [{ type: CostType.Tap }],
            effects: [{ type: EffectType.AddMana, manaType: 'B' }]
        }
    ]
};

