import { AbilityType, CardDefinition, CostType, EffectType } from '@shared/engine_types';
    export const DeathcapGlade: CardDefinition = {
    name: "Deathcap Glade",
    manaCost: "",
    scryfall_id: "78897104-80e1-4d8a-9958-145b40f679e8",
    image_url: "https://cards.scryfall.io/normal/front/7/8/78897104-80e1-4d8a-9958-145b40f679e8.jpg?1775938766",
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
    
