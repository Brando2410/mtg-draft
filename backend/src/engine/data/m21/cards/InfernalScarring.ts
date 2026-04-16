import { AbilityType, Zone, TriggerEvent, CardDefinition, Zone, EffectType, GameEvent, GameObject, TargetType, Restriction } from "@shared/engine_types";

export const InfernalScarring: CardDefinition = {
        name: "Infernal Scarring",
        manaCost: "{1}{B}",
        oracleText: "Enchant creature\nEnchanted creature gets +2/+0.\nWhen enchanted creature dies, draw a card.",
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
                activeZone: Zone.Hand,
                targetDefinition: {
                    type: TargetType.Creature,
                    count: 1
                },
                oracleText: "Enchant creature"
            },
            {
                id: "infernal_scarring_stats",
                type: AbilityType.Static,
                activeZone: Zone.Battlefield,
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
                activeZone: Zone.Battlefield,
                    eventMatch: TriggerEvent.DeathOther,
                condition: (state: any, event: any, source: any) => {
                    const aura = state.battlefield.find((o: any) => o.id === source.sourceId);
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
    };



