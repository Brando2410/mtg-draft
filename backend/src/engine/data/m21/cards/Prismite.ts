import { AbilityType, CostType, CardDefinition, EffectType, TargetMapping } from "@shared/engine_types";

export const Prismite: CardDefinition = {

    name: "Prismite",
    manaCost: "{2}",
    oracleText: "{2}: Add one mana of any color.",
    colors: [],
    supertypes: [],
    types: ["Artifact", "Creature"],
    subtypes: ["Golem"],
    power: "2",
    toughness: "1",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{2}' }],
            isManaAbility: true,
            effects: [{
                type: EffectType.AddMana,
                value: '{ANY}',
                amount: 1,
                targetMapping: TargetMapping.Controller
            }]
        }
    ]
};

