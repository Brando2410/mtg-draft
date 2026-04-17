import {AbilityType, Zone, CardDefinition, EffectType, GameEvent, GameObject, TargetType} from "@shared/engine_types";

export const GarrukSavageHerald: CardDefinition = {
        name: "Garruk, Savage Herald",
        manaCost: "{4}{G}{G}",
        oracleText: "+1: Reveal the top card of your library. If it's a creature card, put it into your hand. Otherwise, put it on the bottom of your library.\n-2: Target creature you control deals damage equal to its power to another target creature.\n-7: Until end of turn, creatures you control gain \"You may have this creature assign its combat damage as though it weren't blocked.\"",
        colors: ["green"],
        supertypes: ["Legendary"],
        types: ["Planeswalker"],
        subtypes: ["Garruk"],
        power: "",
        toughness: "",
        keywords: [],
        loyalty: "5",
        abilities: [
            {
                id: "garruk_savage_herald_plus_1",
                type: AbilityType.Activated,
                activeZone: Zone.Battlefield,
                costs: [{ type: 'Mana', value: '+1' }],
                effects: [{
                    type: EffectType.LookAtTopAndPick,
                    amount: 1,
                    targetMapping: 'CONTROLLER',
                    reveal: true,
                    optional: false,
                    restrictions: [
                { type: 'Type', value: 'creature' }
            ],
                    remainderZone: Zone.Library,
                    libraryPosition: 'bottom'
                }]
            },
            {
                id: "garruk_savage_herald_minus_2",
                type: AbilityType.Activated,
                activeZone: Zone.Battlefield,
                costs: [{ type: 'Mana', value: '-2' }],
                targetDefinition: { 
                    type: 'Permanent', 
                    count: 2, 
                    perTargetRestrictions: [
                        ['Creature', 'YouControl'],
                        ['Creature', 'Other']
                    ] 
                },
                effects: [{
                    type: EffectType.DealDamage,
                    amount: 'TARGET_1_POWER',
                    damageSourceMapping: 'TARGET_1',
                    targetMapping: 'TARGET_2'
                }]
            },
            {
                id: "garruk_savage_herald_minus_7",
                type: AbilityType.Activated,
                activeZone: Zone.Battlefield,
                costs: [{ type: 'Mana', value: '-7' }],
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    duration: 'UNTIL_END_OF_TURN',
                    layer: 6,
                    abilitiesToAdd: ['AssignDamageAsThoughNotBlocked'],
                    targetMapping: 'ALL_CREATURES_YOU_CONTROL'
                }]
            }
        ]
    };

