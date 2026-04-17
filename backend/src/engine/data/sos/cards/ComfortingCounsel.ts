import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
    export const ComfortingCounsel: CardDefinition = {
    name: "Comforting Counsel",
    manaCost: "{1}{G}",
    scryfall_id: "5223a04f-6b47-4379-80ce-8489c4a91734",
    image_url: "https://cards.scryfall.io/normal/front/5/2/5223a04f-6b47-4379-80ce-8489c4a91734.jpg?1775937970",
    colors: [
        "G"
    ],
    types: [
        "Enchantment"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Whenever you gain life, put a growth counter on this enchantment.\nAs long as there are five or more growth counters on this enchantment, creatures you control get +3/+3.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.LifeGain,
            condition: ConditionType.PlayerIsController,
            effects: [
                { type: EffectType.AddCounters, amount: 1, startingCounters: { type: 'growth', amount: 1 }, targetMapping: TargetMapping.Self }
            ]
        },
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    sublayer: 'Stats',
                    powerModifier: 3,
                    toughnessModifier: 3,
                    condition: 'COUNTER_GE:growth,5',
                    targetMapping: TargetMapping.AllCreaturesYouControl
                }
            ]
        }
    ]
};
    
