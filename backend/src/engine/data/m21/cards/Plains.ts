import { AbilityType, CardDefinition, Zone, EffectType } from "@shared/engine_types";

export const Plains: CardDefinition = {

    name: "Plains",
    manaCost: "",
    oracleText: "({T}: Add {W}.)",
    colors: [],
    supertypes: ["Basic"],
    types: ["Land"],
    subtypes: ["Plains"],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            isManaAbility: true,
            costs: [{ type: 'Tap' }],
            effects: [{ type: EffectType.AddMana, value: 'W' }]
        }
    ]
};
