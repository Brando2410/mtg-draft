import { TargetMapping, AbilityType, CardDefinition, CostType, EffectType, TargetType } from '@shared/engine_types';
    export const Forest: CardDefinition = {
    name: "Forest",
    manaCost: "",
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
    

