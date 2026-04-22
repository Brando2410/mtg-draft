import { AbilityType, CardDefinition, EffectType, RestrictionType, TargetMapping, TargetType, TriggerEvent } from "@shared/engine_types";

export const FaithsFetters: CardDefinition = {
    name: "Faith's Fetters",
    manaCost: "{3}{W}",
    scryfall_id: "8e742d49-e6f0-4016-ba4c-11878fad89cb",
    image_url: "https://cards.scryfall.io/normal/front/8/e/8e742d49-e6f0-4016-ba4c-11878fad89cb.jpg?1594734908",
    oracleText: "Enchant permanent\nWhen this Aura enters, you gain 4 life.\nEnchanted permanent can't attack or block, and its activated abilities can't be activated unless they're mana abilities.",
    colors: ["W"],
    types: ["Enchantment"],
    subtypes: ["Aura"],
    keywords: ["Enchant"],
    auraRestriction: { type: TargetType.Permanent, count: 1 },
    abilities: [
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
                restrictionsToAdd: [
                    { type: RestrictionType.CannotAttack },
                    { type: RestrictionType.CannotBlock },
                    { type: RestrictionType.CannotActivateNonManaAbilities }
                ]
            }]
        }
    ]
};
