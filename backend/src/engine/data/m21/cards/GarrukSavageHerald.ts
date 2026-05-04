import { AbilityType, CardDefinition, CostType, DurationType, EffectType, Restriction, TargetMapping, TargetType, Zone } from "@shared/engine_types";

export const GarrukSavageHerald: CardDefinition = {
    name: "Garruk, Savage Herald",
    manaCost: "{4}{G}{G}",
    scryfall_id: "48133629-4a5b-4c91-b496-2ee94f6cbc4c",
    image_url: "https://cards.scryfall.io/normal/front/4/8/48133629-4a5b-4c91-b496-2ee94f6cbc4c.jpg?1596168466",
    oracleText: "+1: Reveal the top card of your library. If it's a creature card, put it into your hand. Otherwise, put it on the bottom of your library.\n-2: Target creature you control deals damage equal to its power to another target creature.\n-7: Until end of turn, creatures you control gain \"You may have this creature assign its combat damage as though it weren't blocked.\"",
    colors: ["G"],
    supertypes: ["Legendary"],
    types: ["Planeswalker"],
    subtypes: ["Garruk"],
    loyalty: "5",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '+1' }],
            effects: [{
                type: EffectType.LookAtTopAndPick,
                amount: 1,
                reveal: true,
                restrictions: [Restriction.Creature],
                remainderZone: Zone.Library,
                libraryPosition: 'bottom',
                targetMapping: TargetMapping.Controller
            }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-2' }],
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 2,
                perTargetRestrictions: [
                    [Restriction.YouControl],
                    [Restriction.Other]
                ]
            }],
            effects: [{
                type: EffectType.DealDamage,
                amount: 'TARGET_1_POWER',
                damageSourceMapping: TargetMapping.Target1,
                targetMapping: TargetMapping.Target2
            }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-7' }],
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                layer: 6,
                abilitiesToAdd: ['AssignDamageAsThoughNotBlocked'],
                targetMapping: TargetMapping.AllCreaturesYouControl
            }]
        }
    ]
};
