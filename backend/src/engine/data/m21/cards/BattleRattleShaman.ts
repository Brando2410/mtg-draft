import { AbilityType, ZoneRequirement, EffectType, TargetType, TriggerEvent, DurationType, CardDefinition, TargetMapping } from '@shared/engine_types';

export const BattleRattleShaman: CardDefinition = {

    name: "Battle-Rattle Shaman",
    manaCost: "{3}{R}",
    oracleText: "At the beginning of combat on your turn, you may have target creature get +2/+0 until end of turn.",
    colors: ["R"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Goblin", "Shaman"],
    power: "2",
    toughness: "2",
    keywords: [],
    abilities: [
        {
            id: "battle_rattle_shaman_trigger",
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.StartOfCombat,
            activeZone: ZoneRequirement.Battlefield,
            condition: (state: any, event: any, source: any) => state.activePlayerId === source.controllerId,
            targetDefinition: { type: TargetType.Creature, count: 1, minCount: 0, optional: true },
            effects: [{ type: EffectType.ApplyContinuousEffect, powerModifier: 2, toughnessModifier: 0, duration: DurationType.UntilEndOfTurn, layer: 7, targetMapping: TargetMapping.Target1 }]
        }
    ]

};


