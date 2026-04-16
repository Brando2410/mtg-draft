import { AbilityType, Zone, CardDefinition, EffectType, TargetType, TriggerEvent, TargetMapping } from "@shared/engine_types";

export const GoblinArsonist: CardDefinition = {
    name: "Goblin Arsonist",
    manaCost: "{R}",
    oracleText: "When this creature dies, you may have it deal 1 damage to any target.",
    colors: ["R"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Goblin", "Shaman"],
    power: "1",
    toughness: "1",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Death,
            activeZone: Zone.Graveyard, // Dies trigger fires from graveyard (Rule 603.10a)
            targetDefinition: {
                type: TargetType.AnyTarget,
                count: 1,
                minCount: 0,
                optional: true
            },
            effects: [{
                type: EffectType.DealDamage,
                amount: 1,
                targetMapping: TargetMapping.Target1
            }],
        }
    ]
};



