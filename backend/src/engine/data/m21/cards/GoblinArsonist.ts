import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent } from "@shared/engine_types";

export const GoblinArsonist: CardDefinition = {
    name: "Goblin Arsonist",
    manaCost: "{R}",

    oracleText: "When this creature dies, you may have it deal 1 damage to any target.",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Goblin", "Shaman"],
    power: "1",
    toughness: "1",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Death,
            targetDefinitions: [{
                type: TargetType.AnyTarget,
                count: 1,
                minCount: 0
            }],
            effects: [{
                type: EffectType.DealDamage,
                amount: 1,
                targetMapping: TargetMapping.Target1
            }]
        }
    ],
    scryfall_id: "fa4bf664-3b92-4598-b905-2bc090958c8b",
    image_url: "https://cards.scryfall.io/normal/front/f/a/fa4bf664-3b92-4598-b905-2bc090958c8b.jpg?1594736650",
    rarity: "common"
};

