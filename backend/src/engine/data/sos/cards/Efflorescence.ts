import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const Efflorescence: CardDefinition = {
    name: "Efflorescence",
    manaCost: "{2}{G}",
    scryfall_id: "79b9ace7-eceb-4f97-9ee7-d5ee3e0b3515",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/7/9/79b9ace7-eceb-4f97-9ee7-d5ee3e0b3515.jpg?1775937979",
    colors: [
        "G"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Put two +1/+1 counters on target creature.\nInfusion — If you gained life this turn, that creature also gains trample and indestructible until end of turn.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{ type: TargetType.Creature, count: 1 }],
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 2,
                    counterType: '+1/+1',
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    condition: ConditionType.GainedLifeThisTurn,
                    duration: { type: DurationType.UntilEndOfTurn },
                    abilitiesToAdd: ['Trample', 'Indestructible'],
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
