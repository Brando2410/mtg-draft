import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const CaptureSphere: CardDefinition = {
    name: "Capture Sphere",
    manaCost: "{3}{U}",
    oracleText: "Flash\nEnchant creature\nWhen Capture Sphere enters the battlefield, tap enchanted creature.\nEnchanted creature doesn't untap during its controller's untap step.",
    colors: ["U"],
    supertypes: [],
    types: ["Enchantment"],
    subtypes: ["Aura"],
    keywords: ["Flash", "Enchant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
            }
        },
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
                restrictions: [{ type: 'CannotUntap' }],
                targetMapping: TargetMapping.EnchantedCreature
            }]
        }
    ]
};
