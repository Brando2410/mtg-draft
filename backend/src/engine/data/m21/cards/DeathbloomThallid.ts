import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const DeathbloomThallid: CardDefinition = {
    name: "Deathbloom Thallid",
    manaCost: "{2}{B}",
    scryfall_id: "dc4513e1-9978-44ce-b7a5-4e2b5b63ad9e",
    image_url: "https://cards.scryfall.io/normal/front/d/c/dc4513e1-9978-44ce-b7a5-4e2b5b63ad9e.jpg?1594736070",
    oracleText: "When Deathbloom Thallid dies, create a 1/1 green Saproling creature token.",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Zombie", "Fungus"],
    power: "3",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Death,
            condition: ConditionType.SelfDied,
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 1,
                    targetMapping: TargetMapping.Controller,
                    tokenBlueprint: {
                        name: "Saproling",
                        colors: ["G"],
                        types: ["Creature"],
                        subtypes: ["Saproling"],
                        power: "1",
                        toughness: "1",
                        image_url: 'https://cards.scryfall.io/large/front/c/5/c519d084-7546-444a-9ef2-5ec2fb5633bc.jpg?1594733703'
                    }
                }
            ]
        }
    ]
};
