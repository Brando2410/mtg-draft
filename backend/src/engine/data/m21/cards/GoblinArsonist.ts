import { AbilityType, Zone, CardDefinition, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const GoblinArsonist: CardDefinition = {
        name: "Goblin Arsonist",
        manaCost: "{R}",
        oracleText: "When this creature dies, you may have it deal 1 damage to any target.",
        colors: ["red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Goblin", "Shaman"],
        power: "1",
        toughness: "1",
        keywords: [],
        abilities: [
            {
                id: "goblin_arsonist_death_trigger",
                type: AbilityType.Triggered,
                    eventMatch: "ON_DEATH",
                activeZone: Zone.Graveyard, // Dies trigger fires from graveyard (Rule 603.10a)
                targetDefinition: {
                    type: TargetType.AnyTarget,
                    count: 1,
                    optional: true
                },
                effects: [{
                    type: EffectType.DealDamage,
                    amount: 1,
                    targetMapping: "TARGET_1"
                }],
                oracleText: "When Goblin Arsonist dies, you may have it deal 1 damage to any target."
            }
        ]
    };



