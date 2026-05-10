import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const EnthrallingHold: CardDefinition = {
    name: "Enthralling Hold",
    manaCost: "{3}{U}{U}",

    oracleText: "Enchant creature\nYou can't choose an untapped creature as this spell's target as you cast it.\nYou control enchanted creature.",
    colors: ["U"],
    types: ["Enchantment"],
    subtypes: ["Aura"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1,
                restrictions: [Restriction.Tapped]
            }]
        },
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                layer: 2,
                duration: { type: DurationType.Static },
                targetMapping: TargetMapping.EnchantedCreature,
                targetControllerId: TargetMapping.Controller
            }]
        }
    ],
    scryfall_id: "d3bc7176-abe0-47cf-a242-cf22a1f590be",
    image_url: "https://cards.scryfall.io/normal/front/d/3/d3bc7176-abe0-47cf-a242-cf22a1f590be.jpg?1594735471",
    rarity: "uncommon"
};

