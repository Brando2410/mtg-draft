import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const MultipleChoice: ImplementableCard = {
    name: 'Multiple Choice',
    manaCost: '{X}{U}',
    type_line: 'Sorcery',
    types: ['Sorcery'],
    subtypes: [],
    power: undefined,
    toughness: undefined,
    keywords: [],
    colors: ['blue'],
    supertypes: [],
    oracleText: 'Choose one —\n• If X is 1, scry 1.\n• If X is 2, return target creature to its owner’s hand.\n• If X is 3, create a 4/4 blue Elemental creature token.\n• If X is 4 or more, scry 1, then return target creature to its owner’s hand, then create a 4/4 blue Elemental creature token.',
    abilities: [
        {
            id: 'multiple_choice_main',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                // X = 1 or X >= 4: Scry 1 then Draw
                {
                    type: EffectType.Scry,
                    condition: 'X_EQUALS:1',
                    fromTop: 1,
                    targetMapping: 'CONTROLLER'
                },
                {
                    type: EffectType.DrawCards,
                    condition: 'X_EQUALS:1',
                    amount: 1,
                    targetMapping: 'CONTROLLER'
                },
                {
                    type: EffectType.Scry,
                    condition: 'X_GE:4',
                    fromTop: 1,
                    targetMapping: 'CONTROLLER'
                },
                {
                    type: EffectType.DrawCards,
                    condition: 'X_GE:4',
                    amount: 1,
                    targetMapping: 'CONTROLLER'
                },

                // X = 2 or X >= 4: May choose player, they return creature
                {
                    type: EffectType.Choice,
                    condition: 'X_EQUALS:2',
                    label: "May choose a player (X=2)",
                    choices: [
                        {
                            label: "Opponent",
                            effects: [{
                                type: EffectType.Choice,
                                targetMapping: 'OPPONENT_1',
                                targetIdMapping: 'TARGET_1_BATTLEFIELD',
                                label: "Opponent: Choose a creature you control to return to its owner's hand",
                                restrictions: ['Creature'],
                                effects: [{ type: EffectType.ReturnToHand, targetMapping: 'SELECTED_CARD' }]
                            }]
                        },
                        {
                            label: "Self",
                            effects: [{
                                type: EffectType.Choice,
                                targetMapping: 'CONTROLLER',
                                targetIdMapping: 'CONTROLLER_BATTLEFIELD',
                                label: "Choose a creature you control to return to its owner's hand",
                                restrictions: ['Creature'],
                                effects: [{ type: EffectType.ReturnToHand, targetMapping: 'SELECTED_CARD' }]
                            }]
                        },
                        {
                            label: "None",
                            effects: []
                        }
                    ]
                } as any,
                {
                    type: EffectType.Choice,
                    condition: 'X_GE:4',
                    label: "May choose a player (X>=4)",
                    choices: [
                        {
                            label: "Opponent",
                            effects: [{
                                type: EffectType.Choice,
                                targetMapping: 'OPPONENT_1',
                                targetIdMapping: 'TARGET_1_BATTLEFIELD',
                                label: "Opponent: Choose a creature you control to return to its owner's hand",
                                restrictions: ['Creature'],
                                effects: [{ type: EffectType.ReturnToHand, targetMapping: 'SELECTED_CARD' }]
                            }]
                        },
                        {
                            label: "Self",
                            effects: [{
                                type: EffectType.Choice,
                                targetMapping: 'CONTROLLER',
                                targetIdMapping: 'CONTROLLER_BATTLEFIELD',
                                label: "Choose a creature you control to return to its owner's hand",
                                restrictions: ['Creature'],
                                effects: [{ type: EffectType.ReturnToHand, targetMapping: 'SELECTED_CARD' }]
                            }]
                        },
                        {
                            label: "None",
                            effects: []
                        }
                    ]
                } as any,

                // X = 3 or X >= 4: Create Elemental
                {
                    type: EffectType.CreateToken,
                    condition: 'X_EQUALS:3',
                    amount: 1,
                    tokenBlueprint: {
                        name: 'Elemental',
                        colors: ['blue', 'red'],
                        types: ['Creature'],
                        subtypes: ['Elemental'],
                        power: '4',
                        toughness: '4'
                    }
                },
                {
                    type: EffectType.CreateToken,
                    condition: 'X_GE:4',
                    amount: 1,
                    tokenBlueprint: {
                        name: 'Elemental',
                        colors: ['blue', 'red'],
                        types: ['Creature'],
                        subtypes: ['Elemental'],
                        power: '4',
                        toughness: '4'
                    }
                }
            ]
        }
    ]
};
