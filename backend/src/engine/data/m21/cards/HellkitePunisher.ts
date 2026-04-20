import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping } from "@shared/engine_types";

export const HellkitePunisher: CardDefinition = {
    name: "Hellkite Punisher",
    manaCost: "{5}{R}{R}",
    scryfall_id: "7bf663d3-850b-4a24-8e4b-08311adf4ed0",
    image_url: "https://cards.scryfall.io/normal/front/7/b/7bf663d3-850b-4a24-8e4b-08311adf4ed0.jpg?1594736690",
    oracleText: "Flying\n{R}: This creature gets +1/+0 until end of turn.",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Dragon"],
    power: "6",
    toughness: "6",
    keywords: ["Flying"],
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{R}' }],
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                powerModifier: 1,
                layer: 7,
                targetMapping: TargetMapping.Self
            }]
        }
    ]
};
