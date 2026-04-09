import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const FaithsFetters: Record<string, ImplementableCard> = {
    "Faith's Fetters": {
        name: "Faith's Fetters",
        manaCost: "{3}{W}",
        oracleText: "Enchant permanent\nWhen this Aura enters, you gain 4 life.\nEnchanted permanent can't attack or block, and its activated abilities can't be activated unless they're mana abilities.",
        colors: ["white"],
        supertypes: [],
        types: ["Enchantment"],
        subtypes: ["Aura"],
        power: "",
        toughness: "",
        keywords: ["Enchant"],
        abilities: [
            {
                id: "faiths_fetters_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Hand,
                targetDefinition: { type: 'Permanent', count: 1 }
            },
            {
                id: "faiths_fetters_etb",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                effects: [{
                    type: EffectType.GainLife,
                    amount: 4,
                    targetMapping: 'CONTROLLER'
                }]
            },
            {
                id: "faiths_fetters_pacifism",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    layer: 6,
                    targetMapping: 'ENCHANTED_PERMANENT'
                }],
                restrictions: [
                    { type: 'CannotAttack' },
                    { type: 'CannotBlock' },
                    { type: 'CannotActivateNonManaAbilities' }
                ]
            }
        ]
    }
};
