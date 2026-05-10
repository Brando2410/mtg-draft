import { AbilityType, CardDefinition, ConditionType, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const TragedyFeaster: CardDefinition = {
    name: "Tragedy Feaster",
    manaCost: "{2}{B}{B}",
    colors: [
        "B"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Demon"
    ],
    keywords: [
        "Trample",
        "Ward—Discard a card"
    ],
    oracleText: "Trample\nWard—Discard a card.\nInfusion — At the beginning of your end step, sacrifice a permanent unless you gained life this turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EndStep,
            effects: [
                {
                    type: EffectType.ConditionalEffect,
                    condition: ConditionType.GainedLifeThisTurn,
                    effects: [],
                    onFailureEffects: [
                        {
                            type: CostType.Sacrifice,
                            targetMapping: TargetMapping.Controller
                        }
                    ]
                }
            ]
        }
    ],
    power: "7",
    toughness: "6",
    scryfall_id: "b93cbaad-8ed8-4a1d-b95a-20a616dfedc9",
    image_url: "https://cards.scryfall.io/normal/front/b/9/b93cbaad-8ed8-4a1d-b95a-20a616dfedc9.jpg?1775937623",
    rarity: "rare"
};

