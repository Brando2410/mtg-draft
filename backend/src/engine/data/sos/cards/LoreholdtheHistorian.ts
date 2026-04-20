import { AbilityType, CardDefinition, ConditionType, EffectType, Restriction, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const LoreholdtheHistorian: CardDefinition = {
    name: "Lorehold, the Historian",
    manaCost: "{3}{R}{W}",
    scryfall_id: "71a6701f-40f1-43ef-bff5-a5907fd67cd6",
    rarity: "mythic",
    image_url: "https://cards.scryfall.io/normal/front/7/1/71a6701f-40f1-43ef-bff5-a5907fd67cd6.jpg?1775938396",
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
                    restrictions: [
                        Restriction.InstantOrSorcery,
                        Restriction.YouControl
                    ],
                    keywordsToAdd: ['Miracle {2}']
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Upkeep,
            condition: ConditionType.EventPlayerIsOpponent,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Discard a card to draw a card?",
                    optional: true,
                    choices: [
                        {
                            label: "Discard 1 and Draw 1",
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
                        }
                    ]
                }
            ]
        }
    ],
    power: "5",
    toughness: "5"
};
