import { AbilityType, CardDefinition, EffectType, TargetMapping } from "@shared/engine_types";

export const FranticInventory: CardDefinition = {
    name: "Frantic Inventory",
    manaCost: "{1}{U}",

    oracleText: "Draw a card, then draw cards equal to the number of cards named Frantic Inventory in your graveyard.",
    colors: ["U"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.DrawCards,
                    amount: "FRANTIC_INVENTORY_COUNT",
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "8f14abb0-0e9f-448e-85d7-6cb71f756c56",
    image_url: "https://cards.scryfall.io/normal/front/8/f/8f14abb0-0e9f-448e-85d7-6cb71f756c56.jpg?1594735485",
    rarity: "common"
};

