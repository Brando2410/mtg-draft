import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const BattleRattleShaman: Record<string, ImplementableCard> = {
    "Battle-Rattle Shaman": {
        name: "Battle-Rattle Shaman",
        manaCost: "{3}{R}",
        oracleText: "At the beginning of combat on your turn, you may have target creature get +2/+0 until end of turn.",
        colors: ["red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Goblin","Shaman"],
        power: "2",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "battle_rattle_shaman_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_BEGINNING_OF_COMBAT_STEP',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => state.activePlayerId === source.controllerId,
                targetDefinition: { type: 'Permanent', count: 1, optional: true, restrictions: ['Creature'] },
                effects: [{ type: 'ApplyContinuousEffect', powerModifier: 2, toughnessModifier: 0, duration: 'UNTIL_END_OF_TURN', layer: 7, targetMapping: 'TARGET_1' }]
            }
        ]
    }
};
