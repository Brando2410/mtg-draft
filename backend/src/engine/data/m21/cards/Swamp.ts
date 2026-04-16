import { AbilityType, ZoneRequirement, CardDefinition, Zone, EffectType, TargetMapping } from "@shared/engine_types";

export const Swamp: CardDefinition = {

    name: "Swamp",
    manaCost: "",
    oracleText: "({T}: Add {B}.)",
    colors: [],
    supertypes: ["Basic"],
    types: ["Land"],
    subtypes: ["Swamp"],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            isManaAbility: true,
            costs: [{ type: 'Tap', targetMapping: TargetMapping.Self }],
            effects: [{ type: EffectType.AddMana, value: 'B' }]
        }
    ]
};
