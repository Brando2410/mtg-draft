import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType } from "@shared/engine_types";

export const KeenGlidemaster: CardDefinition = {
    name: "Keen Glidemaster",
    manaCost: "{1}{U}",

    oracleText: "{2}{U}: Target creature gains flying until end of turn.",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Human", "Soldier"],
    power: "2",
    toughness: "1",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{2}{U}' }],
            targetDefinitions: [{ type: TargetType.Creature, count: 1 }],
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                abilitiesToAdd: ['Flying'],
                targetMapping: TargetMapping.Target1
            }]
        }
    ],
    scryfall_id: "cce6289e-f665-4faa-8285-c843447f3e52",
    image_url: "https://cards.scryfall.io/normal/front/c/c/cce6289e-f665-4faa-8285-c843447f3e52.jpg?1594735543",
    rarity: "common"
};

