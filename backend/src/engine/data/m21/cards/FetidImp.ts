import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping } from "@shared/engine_types";

export const FetidImp: CardDefinition = {
    name: "Fetid Imp",
    manaCost: "{1}{B}",
    scryfall_id: "56a95546-c45a-4da5-b1e8-d5658b5b7d53",
    image_url: "https://cards.scryfall.io/normal/front/5/6/56a95546-c45a-4da5-b1e8-d5658b5b7d53.jpg?1594736117",
    oracleText: "Flying\n{B}: This creature gains deathtouch until end of turn. (Any amount of damage it deals to a creature is enough to destroy it.)",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Imp"],
    power: "1",
    toughness: "2",
    keywords: ["Flying"],
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: "{B}" }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    abilitiesToAdd: ["Deathtouch"],
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ]
};
