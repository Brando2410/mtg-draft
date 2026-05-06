import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping } from '@shared/engine_types';

export const HydroChanneler: CardDefinition = {
    name: "Hydro-Channeler",
    manaCost: "{1}{U}",
    scryfall_id: "0038d212-3d95-4f98-8c2e-7b2404d0ced7",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/0/9/099f8400-d70a-48ef-8ff6-645eae97e072.jpg?1775937286",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Merfolk", "Wizard"],
    keywords: [],
    oracleText: "{T}: Add {U}. Spend this mana only to cast an instant or sorcery spell.\n{1}, {T}: Add one mana of any color. Spend this mana only to cast an instant or sorcery spell.",
    power: "1",
    toughness: "3",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            effects: [
                {
                    type: EffectType.AddMana,
                    manaType: '{U}',
                    manaRestrictions: [Restriction.InstantOrSorcery],
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{1}' }, { type: CostType.Tap }],
            effects: [
                {
                    type: EffectType.AddMana,
                    manaType: 'ANY',
                    manaRestrictions: [Restriction.InstantOrSorcery],
                }
            ]
        }
    ]
};

