import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const HavocJester: Record<string, ImplementableCard> = {
    "Havoc Jester": {
        name: "Havoc Jester",
        manaCost: "{4}{R}",
        oracleText: "Whenever you sacrifice a permanent, this creature deals 1 damage to any target.",
        colors: ["red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Devil"],
        power: "5",
        toughness: "5",
        keywords: [],
        abilities: [
            {
                id: "havoc_jester_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_SACRIFICE',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: 'PLAYER_IS_CONTROLLER',
                targetDefinition: { type: TargetType.AnyTarget, count: 1 },
                effects: [{ type: 'DealDamage', amount: 1, targetMapping: 'ANY_TARGET' }]
            }
        ]
    }
};
