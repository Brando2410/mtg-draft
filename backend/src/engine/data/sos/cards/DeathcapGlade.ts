import { AbilityType, CardDefinition, CostType, EffectType } from '@shared/engine_types';
    export const DeathcapGlade: CardDefinition = {
    name: "Deathcap Glade",
    manaCost: "",
    colors: [],
    types: [
        "Land"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "This land enters tapped unless you control two or more other lands.\n{T}: Add {B} or {G}.",
    entersTappedCondition: "OTHER_LANDS_LE:1",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            isManaAbility: true,
            effects: [{ type: EffectType.AddMana, mana: '{B}' }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            isManaAbility: true,
            effects: [{ type: EffectType.AddMana, mana: '{G}' }]
        }
    ]
};
    