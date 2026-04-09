import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const RambunctiousMutt: Record<string, ImplementableCard> = {
    "Rambunctious Mutt": {
        name: "Rambunctious Mutt",
        manaCost: "{3}{W}{W}",
        oracleText: "When this creature enters, destroy target artifact or enchantment an opponent controls.",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Dog"],
        power: "3",
        toughness: "4",
        keywords: [],
        abilities: [
            {
                id: "rambunctious_mutt_etb",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                triggerEvent: 'ON_ETB',
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['OpponentControl', { types: ['Artifact', 'Enchantment'] }] },
                effects: [{
                    type: EffectType.Destroy,
                    targetMapping: 'TARGET_1'
                }]
            }
        ]
    }
};
