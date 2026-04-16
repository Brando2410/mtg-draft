import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const HavocJester: CardDefinition = {
    name: "Havoc Jester",
    manaCost: "{4}{R}",
    oracleText: "Whenever you sacrifice a permanent, this creature deals 1 damage to any target.",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Devil"],
    power: "5",
    toughness: "5",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Sacrifice,
            activeZone: Zone.Battlefield,
            condition: 'PLAYER_IS_CONTROLLER',
            targetDefinition: { type: TargetType.AnyTarget, count: 1 },
            effects: [{
                type: EffectType.DealDamage,
                amount: 1,
                targetMapping: TargetMapping.Target1
            }]
        }
    ]
};




