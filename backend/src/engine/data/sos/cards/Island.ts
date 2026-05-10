import { AbilityType, CardDefinition, CostType, EffectType } from '@shared/engine_types';

export const Island: CardDefinition = {
    name: "Island",
    manaCost: "",


    colors: [],
    supertypes: ["Basic"],
    types: ["Land"],
    subtypes: ["Island"],
    keywords: [],
    oracleText: "({T}: Add {U}.)",
    abilities: [
        {
            type: AbilityType.Activated,
            isManaAbility: true,
            id: "{T}: Add {U}.",
            costs: [{ type: CostType.Tap }],
            effects: [{ type: EffectType.AddMana, manaType: 'U' }]
        }
    ],
    scryfall_id: "fc9a66a1-367c-4035-a22e-00fab55be5a0",
    image_url: "https://cards.scryfall.io/normal/front/f/c/fc9a66a1-367c-4035-a22e-00fab55be5a0.jpg?1594737796",
    rarity: "common"
};

