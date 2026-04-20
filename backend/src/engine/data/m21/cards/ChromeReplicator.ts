import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const ChromeReplicator: CardDefinition = {
    name: "Chrome Replicator",
    manaCost: "{5}",
    scryfall_id: "1e01bcb4-e823-4da5-b433-e75be3356367",
    image_url: "https://cards.scryfall.io/normal/front/1/e/1e01bcb4-e823-4da5-b433-e75be3356367.jpg?1594737478",
    oracleText: "When this creature enters, if you control two or more nonland, nontoken permanents with the same name as one another, create a 4/4 colorless Construct artifact creature token.",
    colors: [],
    types: ["Artifact", "Creature"],
    subtypes: ["Construct"],
    power: "4",
    toughness: "4",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            condition: 'CONTROL_TWO_OR_MORE_NONLAND_NONTOKEN_PERMANENTS_WITH_SAME_NAME',
            effects: [{
                type: EffectType.CreateToken,
                definition: {
                    name: "Construct",
                    colors: [],
                    types: ["Artifact", "Creature"],
                    subtypes: ["Construct"],
                    power: 4,
                    toughness: 4,
                    image_url: "https://cards.scryfall.io/large/front/a/c/ac5698b6-963d-4c3e-9080-69ce5fb04b4c.jpg?1594733745"
                },
                targetMapping: TargetMapping.Controller
            }]
        }
    ]
};
