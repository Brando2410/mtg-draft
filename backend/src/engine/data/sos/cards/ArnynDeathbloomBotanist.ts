import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const ArnynDeathbloomBotanist: CardDefinition = {
    name: "Arnyn, Deathbloom Botanist",
    manaCost: "{2}{B}",


    colors: [
        "B"
    ],
    types: [
        "Legendary",
        "Creature"
    ],
    subtypes: [
        "Vampire",
        "Druid"
    ],
    keywords: ["Deathtouch"],
    oracleText: "Deathtouch\nWhenever a creature you control with power or toughness 1 or less dies, target opponent loses 2 life and you gain 2 life.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.DeathOther,
            condition: ConditionType.TriggerSourcePowOrToughLe1,
            effects: [
                {
                    type: EffectType.LoseLife,
                    amount: 2,
                    targetMapping: TargetMapping.TargetOpponent
                },
                {
                    type: EffectType.GainLife,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    power: "2",
    toughness: "2",
    scryfall_id: "6168b472-0930-4db5-9920-407340b99050",
    image_url: "https://cards.scryfall.io/normal/front/6/1/6168b472-0930-4db5-9920-407340b99050.jpg?1775937426",
    rarity: "uncommon"
};

