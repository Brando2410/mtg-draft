import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const Forest: CardDefinition = {
    name: "Forest",
    manaCost: "",
    scryfall_id: "3279314f-d639-4489-b2ab-3621bb3ca64b",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/3/2/3279314f-d639-4489-b2ab-3621bb3ca64b.jpg?1594737877",
    colors: [],
    supertypes: ["Basic"],
    types: ["Land"],
    subtypes: ["Forest"],
    keywords: [],
    oracleText: "({T}: Add {G}.)",
    abilities: [
        {
            type: AbilityType.Activated,
            isManaAbility: true,
            costs: [{ type: CostType.Tap }],
            effects: [{ type: EffectType.AddMana, manaType: 'G' }]
        }
    ]
};
