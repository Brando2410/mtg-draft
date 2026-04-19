import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const OrneryDilophosaur: CardDefinition = {

    name: "Ornery Dilophosaur",
    manaCost: "{3}{G}",
    scryfall_id: "c2c4a0e7-9ca4-4291-94de-165cc2ded822",
    image_url: "https://cards.scryfall.io/normal/front/c/2/c2c4a0e7-9ca4-4291-94de-165cc2ded822.jpg?1594737108",
    oracleText: "Deathtouch\nWhenever Ornery Dilophosaur attacks, if you control a creature with power 4 or greater, Ornery Dilophosaur gets +2/+2 until end of turn.",
    colors: ["G"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Dinosaur"],
    power: "2",
    toughness: "2",
    keywords: ["Deathtouch"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            condition: `${ConditionType.HasPermanent}:creature,power>=4`,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 2,
                    toughnessModifier: 2,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Self
                }
            ],
        }
    ]

};
