import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const EnthrallingHold: CardDefinition = {

    name: "Enthralling Hold",
    manaCost: "{3}{U}{U}",
    oracleText: "Enchant creature\nYou can't choose an untapped creature as this spell's target as you cast it.\nYou control enchanted creature.",
    colors: ["blue"],
    supertypes: [],
    types: ["Enchantment"],
    subtypes: ["Aura"],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.Creature, count: 1, restrictions: [
                { type: 'State', value: 'Tapped' }
            ] }
        },
        {
            type: AbilityType.Static,
            activeZone: Zone.Battlefield,
            effects: [{ type: EffectType.ApplyContinuousEffect, layer: 2, duration: { type: DurationType.Static }, targetMapping: 'ENCHANTED_CREATURE', targetControllerId: TargetMapping.Controller }]
        }
    ]

};


