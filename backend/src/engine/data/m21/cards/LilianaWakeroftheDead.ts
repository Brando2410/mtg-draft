import { AbilityType, CardDefinition, ConditionType, CostType, DurationType, DynamicAmount, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, } from '@shared/engine_types';

export const LilianaWakeroftheDead: CardDefinition = {
    name: "Liliana, Waker of the Dead",
    manaCost: "{2}{B}{B}",
    scryfall_id: "e329a3e2-6702-4758-8aac-c3017e77b619",
    image_url: "https://cards.scryfall.io/normal/front/e/3/e329a3e2-6702-4758-8aac-c3017e77b619.jpg?1594739061",
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
                            condition: ConditionType.EventPlayerIsOpponent,
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: -3 }],
            targetDefinitions: [{ type: TargetType.Creature, count: 1 }],
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
            costs: [{ type: CostType.Loyalty, value: -7 }],
            effects: [
                {
                    type: EffectType.CreateEmblem,
                    emblemBlueprint: {
                        name: 'Liliana, Waker of the Dead Emblem',
                        image_url: 'https://cards.scryfall.io/large/front/d/e/defa6875-14f0-466d-9783-605663737ba7.jpg?1594733834',
                        oracleText: 'At the beginning of combat on your turn, put target creature card from a graveyard onto the battlefield under your control. It gains haste.',
                        abilities: [
                            {
                                type: AbilityType.Triggered,
                                eventMatch: TriggerEvent.StartOfCombat,
                                condition: 'IS_YOUR_TURN',
                                targetDefinitions: [{
                                    type: TargetType.CardInGraveyard,
                                    count: 1,
                                    restrictions: [Restriction.Creature]
                                }],
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
