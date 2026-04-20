import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from "@shared/engine_types";

export const Prismite: CardDefinition = {
    name: "Prismite",
    manaCost: "{2}",
    scryfall_id: "eedce8ab-771a-4247-9504-72ae0629df83",
    image_url: "https://cards.scryfall.io/normal/front/e/e/eedce8ab-771a-4247-9504-72ae0629df83.jpg?1594737532",
    oracleText: "{2}: Add one mana of any color.",
    colors: [],
    types: ["Artifact", "Creature"],
    subtypes: ["Golem"],
    power: "2",
    toughness: "1",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{2}' }],
            isManaAbility: true,
            effects: [{
                type: EffectType.AddMana,
                manaType: 'Any',
                amount: 1,
                targetMapping: TargetMapping.Controller
            }]
        }
    ]
};
