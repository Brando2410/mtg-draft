import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent } from "@shared/engine_types";

export const InfernalScarring: CardDefinition = {
    name: "Infernal Scarring",
    manaCost: "{1}{B}",
    scryfall_id: "975e4b8e-add9-439c-9463-e2facee96c10",
    image_url: "https://cards.scryfall.io/normal/front/9/7/975e4b8e-add9-439c-9463-e2facee96c10.jpg?1594736195",
    oracleText: "Enchant creature\nEnchanted creature gets +2/+0.\nWhen enchanted creature dies, draw a card.",
    colors: ["black"],
    supertypes: [],
    types: ["Enchantment"],
    subtypes: ["Aura"],
    keywords: ["Enchant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1
            },
        },
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                layer: 7,
                powerModifier: 2,
                toughnessModifier: 0,
                targetMapping: TargetMapping.EnchantedCreature
            }],
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.DeathOther,
            condition: (state: any, event: any, source: any) => {
                const aura = state.battlefield.find((o: any) => o.id === source.sourceId);
                return aura && event.targetId === aura.attachedTo;
            },
            effects: [{
                type: EffectType.DrawCards,
                amount: 1,
                targetMapping: TargetMapping.Controller
            }],
        }
    ]
};



