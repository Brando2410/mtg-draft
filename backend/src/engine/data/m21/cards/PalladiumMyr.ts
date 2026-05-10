import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from "@shared/engine_types";

export const PalladiumMyr: CardDefinition = {
    name: "Palladium Myr",
    manaCost: "{3}",

    oracleText: "{T}: Add {C}{C}.",
    colors: [],
    types: ["Artifact", "Creature"],
    subtypes: ["Myr"],
    power: "2",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            isManaAbility: true,
            effects: [{
                type: EffectType.AddMana,
                manaType: 'C',
                amount: 2,
                targetMapping: TargetMapping.Controller
            }]
        }
    ],
    scryfall_id: "f7c6aba3-38c3-45d1-83e1-40829eb07862",
    image_url: "https://cards.scryfall.io/normal/front/f/7/f7c6aba3-38c3-45d1-83e1-40829eb07862.jpg?1690005669",
    rarity: "uncommon"
};

