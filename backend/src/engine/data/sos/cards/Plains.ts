
import { AbilityType, CardDefinition, CostType, EffectType } from '@shared/engine_types';

export const Plains: CardDefinition = {
    name: "Plains",
    manaCost: "",


    colors: [],
    supertypes: ["Basic"],
    types: ["Land"],
    subtypes: ["Plains"],
    keywords: [],
    oracleText: "({T}: Add {W}.)",
    abilities: [
        {
            type: AbilityType.Activated,
            isManaAbility: true,
            id: "{T}: Add {W}.",
            costs: [{ type: CostType.Tap }],
            effects: [{ type: EffectType.AddMana, manaType: 'W' }]
        }
    ],
    scryfall_id: "4be96696-aff8-4ef9-97dc-8221ef745de9",
    image_url: "https://cards.scryfall.io/normal/front/4/b/4be96696-aff8-4ef9-97dc-8221ef745de9.jpg?1594737767",
    rarity: "common"
};

