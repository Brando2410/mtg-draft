import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const LoreholdtheHistorian: CardDefinition = {
    name: "Lorehold, the Historian",
    manaCost: "{3}{R}{W}",
    colors: [
        "R",
        "W"
    ],
    types: [
        "Legendary",
        "Creature"
    ],
    subtypes: [
        "Elder",
        "Dragon"
    ],
    keywords: ["Flying", "Haste"],
    oracleText: "Flying, haste\nEach instant and sorcery card in your hand has miracle {2}. (You may cast a card for its miracle cost when you draw it if it's the first card you drew this turn.)\nAt the beginning of each opponent's upkeep, you may discard a card. If you do, draw a card.",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 6,
                    targetMapping: TargetMapping.MatchingCards,
                    activeZones: ['Hand'],
                    restrictions: ['Instant or Sorcery', Restriction.YouControl],
                    keywordsToAdd: ['Miracle {2}']
                }
            ]
        },
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Upkeep,
            condition: 'IS_OPPONENT_UPKEEP',
            effects: [
                {
                    type: CostType.Choice,
                    label: "Discard a card to draw a card?",
                    choices: [
                        {
                            label: "Discard and Draw",
                            effects: [
                                {
                                    type: EffectType.DiscardCards,
                                    targetMapping: TargetMapping.Controller,
                                    amount: 1
                                },
                                {
                                    type: EffectType.DrawCards,
                                    targetMapping: TargetMapping.Controller,
                                    amount: 1
                                }
                            ]
                        },
                        { label: "Decline", effects: [] }
                    ]
                }
            ]
        }
    ],
    power: "5",
    toughness: "5"
};
    