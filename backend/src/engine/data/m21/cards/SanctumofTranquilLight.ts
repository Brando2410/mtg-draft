import { AbilityType, CardDefinition, EffectType, GameEvent, GameObject, TargetType, Zone } from '@shared/engine_types';

export const SanctumofTranquilLight: CardDefinition = {
        name: "Sanctum of Tranquil Light",
        manaCost: "{W}",
        oracleText: "At the beginning of your precombat main phase, you may pay {5-X}, where X is the number of Shrines you control. If you do, tap target creature an opponent controls.",
        colors: ["white"],
        supertypes: ["Legendary"],
        types: ["Enchantment"],
        subtypes: ["Shrine"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "sanctum_tranquil_light_tap",
                type: AbilityType.Activated,
                activeZone: Zone.Battlefield,
                costs: [{ type: 'Mana', value: '{5}{W}' }], // Reduction needed
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [{ type: 'Tap', targetMapping: 'TARGET_1' }],
                costReduction: { type: 'ManaReduction', amount: 'COUNT_Shrine', manaType: 'GENERIC' }
            }
        ]
    };


