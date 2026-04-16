import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const VitoThornoftheDuskRose: CardDefinition = {
    name: "Vito, Thorn of the Dusk Rose",
    manaCost: "{2}{B}",
    oracleText: "Whenever you gain life, target opponent loses that much life.\n{3}{B}{B}: Creatures you control gain lifelink until end of turn.",
    colors: ["B"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Vampire", "Cleric"],
    power: "1",
    toughness: "3",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.LifeGain,
            condition: 'EVENT_PLAYER_IS_YOU',
            targetDefinition: {
                type: TargetType.Opponent,
                count: 1
            },
            effects: [
                {
                    type: EffectType.LoseLife,
                    // Functional amount from life gain event
                    amount: (state: any, source: any, targets: any, context: any) => context?.data?.eventAmount || 0,
                    targetMapping: TargetMapping.Target1
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{3}{B}{B}' }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    abilitiesToAdd: ['Lifelink'],
                    targetMapping: TargetMapping.AllCreaturesYouControl
                }
            ]
        }
    ]
};





