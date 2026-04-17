import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const BrashTaunter: CardDefinition = {

    name: "Brash Taunter",
    manaCost: "{4}{R}",
    scryfall_id: "ebb5e613-a803-42f3-840a-7089ac6b7e3d",
    image_url: "https://cards.scryfall.io/normal/front/e/b/ebb5e613-a803-42f3-840a-7089ac6b7e3d.jpg?1594736510",
    oracleText: "Indestructible\nWhenever this creature is dealt damage, it deals that much damage to target opponent.\n{2}{R}, {T}: This creature fights another target creature.",
    colors: ["R"],
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
            activeZone: Zone.Battlefield,
            effects: [{ type: EffectType.ApplyContinuousEffect, abilitiesToAdd: ['Indestructible'], layer: 6, targetMapping: TargetMapping.Self }]
        },
        {
            id: "brash_taunter_damage_trigger",
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.DamageDealtToCreature,
            activeZone: Zone.Battlefield,
            condition: (state: any, event: any, source: any) => event.targetId === source.sourceId,
            targetDefinition: { type: TargetType.Player, count: 1, restrictions: [
                { type: 'Control', value: 'Opponent' }
            ] },
            effects: [{ type: EffectType.DealDamage, amount: 'EVENT_AMOUNT', targetMapping: TargetMapping.Target1 }]
        },
        {
            id: "brash_taunter_fight",
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [{ type: 'Mana', value: '{2}{R}' }, { type: 'Tap' }],
            targetDefinition: { type: TargetType.Creature, count: 1, restrictions: [
                { type: 'Identity', value: 'Other' }
            ] },
            effects: [{ type: EffectType.Fight, targetMapping: TargetMapping.Target1, target2Mapping: TargetMapping.Target2 }]
        }
    ]

};




