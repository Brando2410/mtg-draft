import { AbilityType, ZoneRequirement, EffectType, DurationType, TargetMapping, CardDefinition } from "@shared/engine_types";

export const OrneryDilophosaur: CardDefinition = {

    name: "Ornery Dilophosaur",
    manaCost: "{3}{G}",
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
            id: "ornery_dilophosaur_attack_trigger",
            type: AbilityType.Triggered,
            eventMatch: "ON_ATTACK",
            condition: "HAS_PERMANENT:creature,power>=4",
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 2,
                    toughnessModifier: 2,
                    duration: DurationType.UntilEndOfTurn,
                    targetMapping: TargetMapping.Self
                }
            ],
            activeZone: ZoneRequirement.Battlefield,
        }
    ]

};


