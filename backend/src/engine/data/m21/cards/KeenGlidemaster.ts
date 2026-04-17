import { AbilityType, DurationType, EffectType, TargetType, CardDefinition, TargetMapping, CostType } from "@shared/engine_types";

export const KeenGlidemaster: CardDefinition = {

    name: "Keen Glidemaster",
    manaCost: "{1}{U}",
    scryfall_id: "cce6289e-f665-4faa-8285-c843447f3e52",
    image_url: "https://cards.scryfall.io/normal/front/c/c/cce6289e-f665-4faa-8285-c843447f3e52.jpg?1594735543",
    oracleText: "{2}{U}: Target creature gains flying until end of turn.",
    colors: ["U"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Human", "Soldier"],
    power: "2",
    toughness: "1",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{2}{U}' }],
            targetDefinition: {
                type: TargetType.Creature,
                count: 1
            },
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                abilitiesToAdd: ['Flying'],
                targetMapping: TargetMapping.Target1
            }],
        }
    ]
};
