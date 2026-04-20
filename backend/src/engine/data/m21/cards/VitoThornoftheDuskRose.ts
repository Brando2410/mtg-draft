import { AbilityType, CardDefinition, ConditionType, CostType, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const VitoThornoftheDuskRose: CardDefinition = {
    name: "Vito, Thorn of the Dusk Rose",
    manaCost: "{2}{B}",
    scryfall_id: "167523f0-fc89-4d8e-9087-73d744ec10f0",
    image_url: "https://cards.scryfall.io/normal/front/1/6/167523f0-fc89-4d8e-9087-73d744ec10f0.jpg?1594736472",
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
            targetDefinition: { type: TargetType.Opponent, count: 1 },
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
    ]
};
