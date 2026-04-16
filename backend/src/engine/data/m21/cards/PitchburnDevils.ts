import { AbilityType, Zone, CardDefinition, EffectType, TargetType, TriggerEvent, TargetMapping } from "@shared/engine_types";

export const PitchburnDevils: CardDefinition = {

    name: "Pitchburn Devils",
    manaCost: "{4}{R}",
    oracleText: "When Pitchburn Devils dies, it deals 3 damage to any target.",
    colors: ["R"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Devil"],
    power: "3",
    toughness: "3",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            activeZone: Zone.Battlefield,
            eventMatch: TriggerEvent.Death,
            targetDefinition: {
                type: TargetType.AnyTarget,
                count: 1
            },
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 3,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};



