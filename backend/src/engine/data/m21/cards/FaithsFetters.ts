import { AbilityType, CardDefinition, EffectType, TargetType, TriggerEvent, TargetMapping } from "@shared/engine_types";

export const FaithsFetters: CardDefinition = {
    name: "Faith's Fetters",
    manaCost: "{3}{W}",
    oracleText: "Enchant permanent\nWhen this Aura enters, you gain 4 life.\nEnchanted permanent can't attack or block, and its activated abilities can't be activated unless they're mana abilities.",
    colors: ["W"],
    supertypes: [],
    types: ["Enchantment"],
    subtypes: ["Aura"],
    power: "",
    toughness: "",
    keywords: ["Enchant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.Permanent, count: 1 }
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [{
                type: EffectType.GainLife,
                amount: 4,
                targetMapping: TargetMapping.Controller
            }]
        },
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                layer: 6,
                targetMapping: TargetMapping.EnchantedPermanent,
                restrictions: [
                    { type: 'CannotAttack' },
                    { type: 'CannotBlock' },
                    { type: 'CannotActivateNonManaAbilities' }
                ]
            }]
        }
    ]
};



