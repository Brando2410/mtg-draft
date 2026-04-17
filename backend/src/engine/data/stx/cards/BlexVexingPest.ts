import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const BlexVexingPest: CardDefinition = {
    name: "Blex, Vexing Pest",
    manaCost: "{2}{G}",
    colors: ["G"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Pest"],
    power: "3",
    toughness: "2",
    oracleText: "Other Pests, Bats, Insects, Snakes, and Spiders you control get +1/+1.\nSearch for Blex: Look at the top five cards of your library. You may put any number of them into your hand and the rest into your graveyard. You lose 3 life for each card put into your hand this way.",
    faces: [
        {
            name: "Blex, Vexing Pest",
            manaCost: "{2}{G}",
            colors: ["G"],
            supertypes: ["Legendary"],
            types: ["Creature"],
            subtypes: ["Pest"],
            power: "3",
            toughness: "2",
            oracleText: "Other Pests, Bats, Insects, Snakes, and Spiders you control get +1/+1.",
            abilities: [{
                type: AbilityType.Static,
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    toughnessModifier: 1,
                    layer: 7,
                    targetMapping: TargetMapping.OtherCreaturesYouControl,
                    restrictions: [
                { type: 'SubtypeIn',
                value: ['Pest',
                { type: 'Type', value: 'Bat' },
                { type: 'Type', value: 'Insect' },
                { type: 'Type', value: 'Snake' },
                { type: 'Type', value: 'Spider' }
            ] }]
                }]
            }]
        },
        {
            name: "Search for Blex",
            manaCost: "{2}{B}{B}",
            colors: ["B"],
            types: ["Sorcery"],
            oracleText: "Look at the top five cards of your library. You may put any number of them into your hand and the rest into your graveyard. You lose 3 life for each card put into your hand this way.",
                abilities: [{
                type: AbilityType.Spell,
                effects: [{
                    type: EffectType.LookAtTopAndPick,
                    fromTop: 5,
                    zone: Zone.Hand,
                    remainderZone: Zone.Graveyard,
                    amount: 'ANY' as any
                }]
            }]
        }
    ]
};

