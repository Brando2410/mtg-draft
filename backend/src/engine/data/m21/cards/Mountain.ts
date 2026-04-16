import { AbilityType, Zone, EffectType, TargetMapping, CardDefinition, Zone } from "@shared/engine_types";

export const Mountain: CardDefinition = {

    name: "Mountain",
    manaCost: "",
    oracleText: "({T}: Add {R}.)",
    colors: [],
    supertypes: ["Basic"],
    types: ["Land"],
    subtypes: ["Mountain"],
    keywords: [],
    abilities: [
        {
            id: "mountain_mana",
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            isManaAbility: true,
            costs: [{ type: 'Tap', targetMapping: TargetMapping.Self }],
            effects: [{ type: EffectType.AddMana, value: 'R' }]
        }
    ]

};

