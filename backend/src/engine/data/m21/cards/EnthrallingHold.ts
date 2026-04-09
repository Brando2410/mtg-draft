import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const EnthrallingHold: Record<string, ImplementableCard> = {
    "Enthralling Hold": {
        name: "Enthralling Hold",
        manaCost: "{3}{U}{U}",
        oracleText: "Enchant creature\nYou can't choose an untapped creature as this spell's target as you cast it.\nYou control enchanted creature.",
        colors: ["blue"],
        supertypes: [],
        types: ["Enchantment"],
        subtypes: ["Aura"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "enthralling_hold_aura",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'ApplyContinuousEffect', layer: 2, value: 'CONTROL_ENCHANTED', targetMapping: 'SELF' }]
            }
        ]
    }
};
