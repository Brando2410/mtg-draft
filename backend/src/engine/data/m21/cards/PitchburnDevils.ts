import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent } from "@shared/engine_types";

export const PitchburnDevils: CardDefinition = {
    name: "Pitchburn Devils",
    manaCost: "{4}{R}",
    scryfall_id: "fbd306cf-6625-4414-b9e5-4b909bb1bb13",
    image_url: "https://cards.scryfall.io/normal/front/f/b/fbd306cf-6625-4414-b9e5-4b909bb1bb13.jpg?1594736737",
    oracleText: "When Pitchburn Devils dies, it deals 3 damage to any target.",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Devil"],
    power: "3",
    toughness: "3",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Death,
            targetDefinition: { type: TargetType.AnyTarget, count: 1 },
            effects: [{
                type: EffectType.DealDamage,
                amount: 3,
                targetMapping: TargetMapping.Target1
            }]
        }
    ]
};
