import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const BattleRattleShaman: CardDefinition = {

    name: "Battle-Rattle Shaman",
    manaCost: "{3}{R}",
    scryfall_id: "faca827d-0b35-48d7-acd6-13ecacc32b82",
    image_url: "https://cards.scryfall.io/normal/front/f/a/faca827d-0b35-48d7-acd6-13ecacc32b82.jpg?1594736472",
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
            activeZone: Zone.Battlefield,
            condition: (state: any, event: any, source: any) => state.activePlayerId === source.controllerId,
            targetDefinition: { type: TargetType.Creature, count: 1, minCount: 0, optional: true },
            effects: [{ type: EffectType.ApplyContinuousEffect, powerModifier: 2, toughnessModifier: 0, duration: { type: DurationType.UntilEndOfTurn }, layer: 7, targetMapping: TargetMapping.Target1 }]
        }
    ]

};



