import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const ChandrasIncinerator: Record<string, ImplementableCard> = {
    "Chandra's Incinerator": {
        name: "Chandra's Incinerator",
        manaCost: "{5}{R}",
        oracleText: "This spell costs {X} less to cast, where X is the total amount of noncombat damage dealt to your opponents this turn.\nTrample\nWhenever a source you control deals noncombat damage to an opponent, this creature deals that much damage to target creature or planeswalker that player controls.",
        colors: ["red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Elemental"],
        power: "6",
        toughness: "6",
        keywords: ["Trample"],
        abilities: [
            {
                id: "chandra_incinerator_discount",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Hand,
                effects: [{ type: 'CostReduction', value: 'NONCOMBAT_DAMAGE_DEALT_THIS_TURN', targetMapping: 'SELF' }]
            },
            {
                id: "chandra_incinerator_trample_damage",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_NONCOMBAT_DAMAGE_OPPONENT',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => state.players[event.playerId]?.isOpponentOf?.(source.controllerId) || event.playerId !== source.controllerId,
                effects: [{ type: 'DealDamage', amount: 'DAMAGE_DEALT_AMOUNT', targetMapping: 'TARGET_CREATURE_OR_PW_OPPONENT' }]
            }
        ]
    }
};


