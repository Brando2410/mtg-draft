import { TargetMapping, AbilityType, CardDefinition, CostType, EffectType, TargetType } from '@shared/engine_types';
    export const Forest: CardDefinition = {
    name: "Forest",
    manaCost: "",
    scryfall_id: "3279314f-d639-4489-b2ab-3621bb3ca64b",
    image_url: "https://cards.scryfall.io/normal/front/3/2/3279314f-d639-4489-b2ab-3621bb3ca64b.jpg?1594737877",
    colors: [],
    types: [
        "Basic",
        "Land"
    ],
    subtypes: [
        "Forest"
    ],
    keywords: [],
    oracleText: "({T}: Add {G}.)",
    abilities: [
        {
            id: "forest_mana",
            type: AbilityType.Activated,
            isManaAbility: true,
            costs: [{ type: CostType.Tap, targetMapping: TargetMapping.Self }],
            effects: [{ type: EffectType.AddMana, value: '{G}' }]
        }
    ]
};
    

