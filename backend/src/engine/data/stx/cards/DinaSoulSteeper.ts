import { AbilityType, CardDefinition, CostType, DurationType, EffectType, Restriction, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const DinaSoulSteeper: CardDefinition = {
    name: 'Dina, Soul Steeper',
    manaCost: '{B}{G}',
    scryfall_id: "9cd2b567-0cf7-4441-b3ce-e31141dd91c8",
    image_url: "https://cards.scryfall.io/normal/front/9/c/9cd2b567-0cf7-4441-b3ce-e31141dd91c8.jpg?1627428607",
    colors: ['B', 'G'],
    types: ['Creature'],
    subtypes: ['Dryad', 'Druid'],
    supertypes: ['Legendary'],
    power: "1",
    toughness: "1",
    oracleText: "Whenever you gain life, each opponent loses 1 life.\n{1}, Sacrifice another creature: Dina, Soul Steeper gets +X/+0 until end of turn, where X is the sacrificed creature's power.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.LifeGain,
            condition: 'YouGainedLife',
            effects: [{ type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.EachOpponent }]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{1}' },
                { type: CostType.Sacrifice, restrictions: [Restriction.Creature, Restriction.Other] }
            ],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.Self,
                    duration: { type: DurationType.UntilEndOfTurn },
                    powerModifier: 'SACRIFICED_OBJECT_POWER'
                }
            ]
        }
    ]
};


