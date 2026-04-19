import { AbilityType, CardDefinition, EffectType, TriggerEvent, Zone } from "@shared/engine_types";

export const DeathbloomThallid: CardDefinition = {
        name: "Deathbloom Thallid",
        manaCost: "{2}{B}",
    scryfall_id: "dc4513e1-9978-44ce-b7a5-4e2b5b63ad9e",
    image_url: "https://cards.scryfall.io/normal/front/d/c/dc4513e1-9978-44ce-b7a5-4e2b5b63ad9e.jpg?1594736070",
        oracleText: "When Deathbloom Thallid dies, create a 1/1 green Saproling creature token.",
        colors: ["black"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Zombie", "Fungus"],
        power: "3",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "deathbloom_thallid_death",
                type: AbilityType.Triggered,
                activeZone: Zone.Battlefield,
                    eventMatch: TriggerEvent.Death,
                effects: [
                    {
                        type: EffectType.CreateToken,
                        amount: 1,
                        targetMapping: "CONTROLLER",
                        tokenBlueprint: {
                            name: "Saproling",
                            colors: ["green"],
                            types: ["Creature"],
                            subtypes: ["Saproling"],
                            power: "1",
                            toughness: "1"
                        }
                    }
                ]
            }
        ]
    };



