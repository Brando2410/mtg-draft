import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent } from "@shared/engine_types";

export const InfernalScarring: CardDefinition = {
    name: "Infernal Scarring",
    manaCost: "{1}{B}",
    scryfall_id: "975e4b8e-add9-439c-9463-e2facee96c10",
    image_url: "https://cards.scryfall.io/normal/front/9/7/975e4b8e-add9-439c-9463-e2facee96c10.jpg?1594736195",
    oracleText: "Enchant creature\nEnchanted creature gets +2/+0.\nWhen enchanted creature dies, draw a card.",
    colors: ["B"],
    types: ["Enchantment"],
    subtypes: ["Aura"],
    keywords: ["Enchant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{ type: TargetType.Creature, count: 1 }]
        },
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                layer: 7,
                powerModifier: 2,
                targetMapping: TargetMapping.EnchantedCreature
            }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Death,
            condition: 'IS_ENCHANTED_CREATURE',
            effects: [{
                type: EffectType.DrawCards,
                amount: 1,
                targetMapping: TargetMapping.Controller
            }]
        }
    ]
};
