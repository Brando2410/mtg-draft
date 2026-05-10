import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const HistorianofZhalfir: CardDefinition = {
    name: "Historian of Zhalfir",
    manaCost: "{2}{U}{U}",

    oracleText: "Whenever Historian of Zhalfir attacks, if you control a Teferi planeswalker, draw a card.",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Human", "Wizard"],
    power: "3",
    toughness: "3",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            condition: 'IS_SOURCE && YOU_CONTROL_TEFERI_PLANESWALKER',
            effects: [{
                type: EffectType.DrawCards,
                amount: 1,
                targetMapping: TargetMapping.Controller
            }]
        }
    ],
    scryfall_id: "ae981da0-f32c-49d5-bcb0-2b9255a4e1fe",
    image_url: "https://cards.scryfall.io/normal/front/a/e/ae981da0-f32c-49d5-bcb0-2b9255a4e1fe.jpg?1596250023",
    rarity: "uncommon"
};

