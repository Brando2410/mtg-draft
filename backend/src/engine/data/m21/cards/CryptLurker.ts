import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from "@shared/engine_types";

export const CryptLurker: CardDefinition = {
    name: "Crypt Lurker",
    manaCost: "{3}{B}",

    oracleText: "When Crypt Lurker enters the battlefield, you may sacrifice a creature or discard a creature card. If you do, draw a card.",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Horror"],
    power: "3",
    toughness: "4",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.Choice,
                    optional: true,
                    label: "Sacrifice a creature or discard a creature card?",
                    choices: [
                        {
                            label: "Sacrifice a creature",
                            effects: [
                                {
                                    type: EffectType.Sacrifice,
                                    targetDefinitions: [{
                                        type: TargetType.Creature,
                                        count: 1,
                                        restrictions: [Restriction.YouControl]
                                    }],
                                    effects: [
                                        {
                                            type: EffectType.DrawCards,
                                            amount: 1,
                                            targetMapping: TargetMapping.Controller
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            label: "Discard a creature card, then draw a card",
                            effects: [
                                {
                                    type: EffectType.DiscardCards,
                                    amount: 1,
                                    restrictions: [Restriction.Creature],
                                    targetMapping: TargetMapping.Controller,
                                    effects: [
                                        {
                                            type: EffectType.DrawCards,
                                            amount: 1,
                                            targetMapping: TargetMapping.Controller
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "c0bba170-5176-4fab-a10d-e23d70128875",
    image_url: "https://cards.scryfall.io/normal/front/c/0/c0bba170-5176-4fab-a10d-e23d70128875.jpg?1594736052",
    rarity: "common"
};

