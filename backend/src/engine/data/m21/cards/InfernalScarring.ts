import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const InfernalScarring: Record<string, ImplementableCard> = {
    "Infernal Scarring": {
        name: "Infernal Scarring",
        manaCost: "{1}{B}",
        oracleText: "Enchant creature\nEnchanted creature gets +2/+0 and has \"When this creature dies, draw a card.\"",
        colors: ["black"],
        supertypes: [],
        types: ["Enchantment"],
        subtypes: ["Aura"],
        power: undefined,
        toughness: undefined,
        keywords: ["Enchant"],
        abilities: [
            {
                id: "infernal_scarring_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Hand,
                targetDefinition: {
                    type: TargetType.Permanent,
                    count: 1,
                    minCount: 1,
                    restrictions: ["creature"]
                },
                oracleText: "Enchant creature"
            },
            {
                id: "infernal_scarring_stats",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    layer: 7,
                    powerModifier: 2,
                    toughnessModifier: 0,
                    targetMapping: "ENCHANTED_CREATURE"
                }],
                oracleText: "Enchanted creature gets +2/+0."
            },
            {
                id: "infernal_scarring_death_trigger",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                triggerEvent: "ON_DEATH",
                triggerCondition: (state: any, event: any, source: any) => {
                    const aura = state.battlefield.find((o: any) => o.id === source.sourceId);
                    console.log(aura, event.targetId, aura.attachedTo);
                    return aura && event.targetId === aura.attachedTo;
                },
                effects: [{
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: "CONTROLLER"
                }],
                oracleText: "When enchanted creature dies, draw a card."
            }
        ]
    }
};
