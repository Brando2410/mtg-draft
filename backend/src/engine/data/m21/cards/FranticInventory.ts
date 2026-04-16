import { AbilityType, Zone, CardDefinition, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const FranticInventory: CardDefinition = {
        name: "Frantic Inventory",
        manaCost: "{1}{U}",
        oracleText: "Draw a card, then draw cards equal to the number of cards named Frantic Inventory in your graveyard.",
        colors: ["blue"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: "",
        toughness: "",
        keywords: [],
        abilities: [
            {
                id: "frantic_inventory_spell",
                type: AbilityType.Spell,
                activeZone: Zone.Hand,
                effects: [
                    {
                        type: EffectType.DrawCards,
                        amount: 1,
                        targetMapping: "CONTROLLER"
                    },
                    {
                        type: EffectType.DrawCards,
                        amount: "FRANTIC_INVENTORY_COUNT",
                        targetMapping: "CONTROLLER"
                    }
                ],
                oracleText: "Draw a card, then draw cards equal to the number of cards named Frantic Inventory in your graveyard."
            }
        ]
    };

