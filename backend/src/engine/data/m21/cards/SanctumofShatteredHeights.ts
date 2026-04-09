import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const SanctumofShatteredHeights: Record<string, ImplementableCard> = {
    "Sanctum of Shattered Heights": {
        name: "Sanctum of Shattered Heights",
        manaCost: "{2}{R}",
        oracleText: "At the beginning of your precombat main phase, you may pay {1}. If you do, Sanctum of Shattered Heights deals X damage to target creature or planeswalker an opponent controls, where X is the number of Shrines you control.",
        colors: ["red"],
        supertypes: ["Legendary"],
        types: ["Enchantment"],
        subtypes: ["Shrine"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "sanctum_shattered_heights_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_PRE_COMBAT_MAIN_PHASE_START',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                costs: [{ type: 'Mana', value: '{1}' }, { type: 'Discard', targetMapping: 'SELF' }], // Wait, Shattered Heights cost is discard card
                effects: [{ type: 'DealDamage', amount: 'COUNT_Shrine', targetMapping: 'TARGET_1' }],
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'Planeswalker'] }
            }
        ]
    }
};
