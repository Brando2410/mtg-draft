import { AbilityType, CardDefinition, EffectType, RestrictionType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const CaptureSphere: CardDefinition = {
    name: "Capture Sphere",
    manaCost: "{3}{U}",

    oracleText: "Flash\nEnchant creature\nWhen Capture Sphere enters the battlefield, tap enchanted creature.\nEnchanted creature doesn't untap during its controller's untap step.",
    colors: ["U"],
    types: ["Enchantment"],
    subtypes: ["Aura"],
    keywords: ["Flash", "Enchant"],
    auraRestrictions: [{
        type: TargetType.Creature,
        count: 1
    }],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [{
                type: EffectType.Tap,
                targetMapping: TargetMapping.EnchantedCreature
            }]
        },
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                layer: 6,
                restrictionsToAdd: [{ type: RestrictionType.CannotUntap }],
                targetMapping: TargetMapping.EnchantedCreature
            }]
        }
    ],
    scryfall_id: "f5ed9f08-56e8-4e24-aae2-05270d7c1ba8",
    image_url: "https://cards.scryfall.io/normal/front/f/5/f5ed9f08-56e8-4e24-aae2-05270d7c1ba8.jpg?1594735438",
    rarity: "common"
};

