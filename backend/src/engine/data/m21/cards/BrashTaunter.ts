import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const BrashTaunter: Record<string, ImplementableCard> = {
    "Brash Taunter": {
        name: "Brash Taunter",
        manaCost: "{4}{R}",
        oracleText: "Indestructible\nWhenever this creature is dealt damage, it deals that much damage to target opponent.\n{2}{R}, {T}: This creature fights another target creature.",
        colors: ["red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Goblin"],
        power: "1",
        toughness: "1",
        keywords: ["Indestructible"],
        abilities: [
            {
                id: "brash_taunter_indestructible",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'ApplyContinuousEffect', abilitiesToAdd: ['Indestructible'], layer: 6, targetMapping: 'SELF' }]
            },
            {
                id: "brash_taunter_damage_trigger",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_DAMAGE_DEALT_TO_CREATURE',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => event.targetId === source.sourceId,
                targetDefinition: { type: 'Player', count: 1, restrictions: ['Opponent'] },
                effects: [{ type: 'DealDamage', amount: 'EVENT_AMOUNT', targetMapping: 'TARGET_1' }]
            },
            {
                id: "brash_taunter_fight",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{2}{R}' }, { type: 'Tap', value: null }],
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'Other'] },
                effects: [{ type: 'Fight', targetMapping: 'SELF_AND_TARGET_1' }]
            }
        ]
    }
};


