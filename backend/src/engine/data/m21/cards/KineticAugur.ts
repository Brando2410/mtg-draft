import { AbilityType, Zone, EffectType, TargetMapping, TriggerEvent, CardDefinition } from "@shared/engine_types";

export const KineticAugur: CardDefinition = {

    name: "Kinetic Augur",
    manaCost: "{3}{R}",
    scryfall_id: "dc5e8221-fc2d-4d90-80f3-729606648c54",
    image_url: "https://cards.scryfall.io/normal/front/d/c/dc5e8221-fc2d-4d90-80f3-729606648c54.jpg?1594736717",
    oracleText: "Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\nKinetic Augur's power is equal to the number of instant and sorcery cards in your graveyard.\nWhen this creature enters, discard up to two cards, then draw that many cards.",
    colors: ["R"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Human", "Shaman"],
    power: "*",
    toughness: "4",
    keywords: ["Trample"],
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 7,
                    powerDynamic: 'INSTANTS_AND_SORCERIES_IN_GRAVEYARD',
                    targetMapping: TargetMapping.Self
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Discard up to two cards, then draw that many.",
                    choices: [
                        {
                            label: "Discard 0",
                            effects: []
                        },
                        {
                            label: "Discard 1",
                            effects: [
                                { type: EffectType.DiscardCards, amount: 1, targetMapping: TargetMapping.Controller },
                                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }
                            ]
                        },
                        {
                            label: "Discard 2",
                            effects: [
                                { type: EffectType.DiscardCards, amount: 2, targetMapping: TargetMapping.Controller },
                                { type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Controller }
                            ]
                        }
                    ]
                }
            ]
        }
    ]

};



