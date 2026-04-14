import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType, Restriction } from "@shared/engine_types";

export const CryptLurker: Record<string, ImplementableCard> = {
    "Crypt Lurker": {
        name: "Crypt Lurker",
        manaCost: "{3}{B}",
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
                activeZone: ZoneRequirement.Battlefield,
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
    }
};


