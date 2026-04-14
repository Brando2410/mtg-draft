import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType, DurationType } from '@shared/engine_types';

export const PackLeader: Record<string, ImplementableCard> = {
    "Pack Leader": {
        name: "Pack Leader",
        manaCost: "{1}{W}",
        oracleText: "Other Dogs you control get +1/+1.\nWhenever this creature attacks, prevent all combat damage that would be dealt this turn to Dogs you control.",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Dog"],
        power: "2",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "pack_leader_anthem",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{
                    type: 'ApplyContinuousEffect',
                    powerModifier: 1,
                    toughnessModifier: 1,
                    layer: 7,
                    targetMapping: 'MATCHING_PERMANENTS_YOU_CONTROL',
                    restrictions: ['Dog', 'other']
                }]
            },
            {
                id: "pack_leader_attack_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ATTACK',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.data?.attackerId === source.sourceId,
                effects: [{
                    type: 'AddPreventionEffect',
                    damageType: 'CombatDamage',
                    targetMapping: 'MATCHING_PERMANENTS_YOU_CONTROL',
                    restrictions: ['Dog'],
                    duration: DurationType.UntilEndOfTurn
                }]
            }
        ]
    }
};
