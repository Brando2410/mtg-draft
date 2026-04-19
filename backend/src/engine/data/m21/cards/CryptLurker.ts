import { AbilityType, CardDefinition, EffectType, Restriction, TargetType, Zone } from "@shared/engine_types";

export const CryptLurker: CardDefinition = {
        name: "Crypt Lurker",
        manaCost: "{3}{B}",
    scryfall_id: "c0bba170-5176-4fab-a10d-e23d70128875",
    image_url: "https://cards.scryfall.io/normal/front/c/0/c0bba170-5176-4fab-a10d-e23d70128875.jpg?1594736052",
        oracleText: "When Crypt Lurker enters the battlefield, you may sacrifice a creature or discard a creature card. If you do, draw a card.",
        colors: ["black"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Horror"],
        power: "3",
        toughness: "4",
        keywords: [],
        abilities: [
            {
                id: "crypt_lurker_etb",
                type: AbilityType.Triggered,
                activeZone: Zone.Battlefield,
                    eventMatch: "ON_ETB",
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
                                        targetDefinition: {
                                            type: TargetType.Creature,
                                            count: 1,
                                            restrictions: [Restriction.YouControl]
                                        },
                                        targetMapping: "CONTROLLER",
                                        effects: [
                                            {
                                                type: EffectType.DrawCards,
                                                amount: 1,
                                                targetMapping: "CONTROLLER"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                label: "Discard a creature card",
                                effects: [
                                    {
                                        type: EffectType.DiscardCards,
                                        amount: 1,
                                        restrictions: [Restriction.Creature],
                                        targetMapping: "CONTROLLER",
                                        effects: [
                                            {
                                                type: EffectType.DrawCards,
                                                amount: 1,
                                                targetMapping: "CONTROLLER"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };



