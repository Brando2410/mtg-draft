import { AbilityType, CardDefinition, CostType, DurationType, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const LilianaWakeroftheDead: CardDefinition = {
    name: "Liliana, Waker of the Dead",
    manaCost: "{2}{B}{B}",
    oracleText: "+1: Each player discards a card. Each opponent who can't loses 3 life.\n−3: Target creature gets -X/-X until end of turn, where X is the number of cards in your graveyard.\n−7: You get an emblem with \"At the beginning of combat on your turn, put target creature card from a graveyard onto the battlefield under your control. It gains haste.\"",
    colors: ["B"],
    supertypes: ["Legendary"],
    types: ["Planeswalker"],
    subtypes: ["Liliana"],
    loyalty: 4,
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: 1 }],
            effects: [
                {
                    type: EffectType.DiscardCards,
                    amount: 1,
                    targetMapping: TargetMapping.EachPlayer,
                    onFailureEffects: [
                        {
                            type: EffectType.LoseLife,
                            amount: 3,
                            condition: 'EVENT_PLAYER_IS_OPPONENT',
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: -3 }],
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
            },
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                powerModifier: DynamicAmount.GraveyardSizeNegative,
                toughnessModifier: DynamicAmount.GraveyardSizeNegative,
                targetMapping: TargetMapping.Target1
            }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-7' }],
            effects: [
                {
                    type: EffectType.CreateEmblem,
                    emblemBlueprint: {
                        name: 'Liliana, Waker of the Dead Emblem',
                        oracleText: 'At the beginning of combat on your turn, put target creature card from a graveyard onto the battlefield under your control. It gains haste.',
                        abilities: [
                            {
                                type: AbilityType.Triggered,
                                eventMatch: TriggerEvent.StartOfCombat,
                                condition: 'IS_YOUR_TURN',
                                targetDefinition: {
                                    type: TargetType.CardInGraveyard,
                                    count: 1,
                                    restrictions: ['Creature']
                                },
                                effects: [
                                    { type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.Target1 },
                                    {
                                        type: EffectType.ApplyContinuousEffect,
                                        abilitiesToAdd: ['Haste'],
                                        duration: { type: DurationType.Permanent },
                                        targetMapping: TargetMapping.Target1
                                    }
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    ]
};



