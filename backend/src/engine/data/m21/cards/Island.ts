import { AbilityType, Zone, EffectType, CardDefinition, TargetMapping } from "@shared/engine_types";

export const Island: CardDefinition = {

    name: "Island",
    manaCost: "",
    oracleText: "({T}: Add {U}.)",
    colors: [],
    supertypes: ["Basic"],
    types: ["Land"],
    subtypes: ["Island"],
    power: undefined,
    toughness: undefined,
    keywords: [],
    abilities: [
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            isManaAbility: true,
            costs: [{ type: 'Tap', targetMapping: TargetMapping.Self }],
            effects: [{ type: EffectType.AddMana, value: 'U' }]
        }
    ]
};
