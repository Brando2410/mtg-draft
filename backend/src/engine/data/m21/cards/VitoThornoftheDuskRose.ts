import { AbilityType, CardDefinition, ConditionType, CostType, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

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
            condition: ConditionType.PlayerIsController,
            targetDefinitions: [{ type: TargetType.Opponent, count: 1 }],
            effects: [
                {
                    type: EffectType.LoseLife,
                    amount: 'EVENT_LIFE_GAINED_AMOUNT',
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
    ],
    scryfall_id: "0fe79ee4-c3f3-4a6b-a967-203ca3b70ee5",
    image_url: "https://cards.scryfall.io/normal/front/0/f/0fe79ee4-c3f3-4a6b-a967-203ca3b70ee5.jpg?1594736442",
    rarity: "rare"
};

