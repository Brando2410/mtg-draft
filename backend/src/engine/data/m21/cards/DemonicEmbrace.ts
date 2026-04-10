import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const DemonicEmbrace: Record<string, ImplementableCard> = {
    "Demonic Embrace": {
        name: "Demonic Embrace",
        manaCost: "{1}{B}{B}",
        oracleText: "Enchant creature\nEnchanted creature gets +3/+1, has flying, and is a Demon in addition to its other types.\nYou may cast this card from your graveyard by paying 3 life and discarding a card in addition to paying its other costs.",
        colors: ["black"],
        supertypes: [],
        types: ["Enchantment"],
        subtypes: ["Aura"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "demonic_embrace_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] }
            },
            {
                id: "demonic_embrace_aura",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [
                    { 
                        type: EffectType.ApplyContinuousEffect, 
                        layer: 4, 
                        subtypesToAdd: ['Demon'], 
                        targetMapping: 'ENCHANTED_CREATURE' 
                    },
                    { 
                        type: EffectType.ApplyContinuousEffect, 
                        layer: 6, 
                        abilitiesToAdd: ['Flying'], 
                        targetMapping: 'ENCHANTED_CREATURE' 
                    },
                    { 
                        type: EffectType.ApplyContinuousEffect, 
                        layer: 7, 
                        powerModifier: 3, 
                        toughnessModifier: 1, 
                        targetMapping: 'ENCHANTED_CREATURE' 
                    }
                ]
            },
            {
                id: "demonic_embrace_graveyard_cast",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Graveyard,
                effects: [{ type: 'AllowCastFromGraveyard', additionalCosts: [{ type: 'PayLife', value: 3 }, { type: 'Discard', amount: 1 }], targetMapping: 'SELF' }]
            }
        ]
    }
};
