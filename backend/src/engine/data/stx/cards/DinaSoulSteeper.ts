import { AbilityType, CardDefinition, CostType, DurationType, EffectType, Restriction, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const DinaSoulSteeper: CardDefinition = {
    name: 'Dina, Soul Steeper',
    manaCost: '{B}{G}',

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
    ],
    scryfall_id: "6ae992b6-506b-4667-884f-4f7fc075b71e",
    image_url: "https://cards.scryfall.io/normal/front/6/a/6ae992b6-506b-4667-884f-4f7fc075b71e.jpg?1775941723",
    rarity: "uncommon"
};

