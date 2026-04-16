import {AbilityType, Zone, CardDefinition, EffectType, GameEvent, GameObject, TargetType, RestrictionType} from "@shared/engine_types";

export const CarrionGrub: CardDefinition = {
        name: "Carrion Grub",
        manaCost: "{3}{B}",
        oracleText: "Carrion Grub's power is equal to the greatest power among creature cards in your graveyard.\nWhen Carrion Grub enters the battlefield, mill four cards.",
        colors: ["black"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Insect", "Horror"],
        power: "0",
        toughness: "5",
        keywords: [],
        abilities: [
            {
                id: "carrion_grub_cda",
                type: AbilityType.Static,
                activeZone: Zone.Any, // CDAs function in all zones
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        targetMapping: "SELF",
                        duration: { type: "STATIC" },
                        layer: 7,
                        sublayer: "7a",
                        powerDynamic: "GREATEST_POWER_IN_GRAVEYARD"
                    }
                ]
            },
            {
                id: "carrion_grub_etb",
                type: AbilityType.Triggered,
                activeZone: Zone.Battlefield,
                    eventMatch: "ON_ETB",
                effects: [
                    {
                        type: EffectType.Mill,
                        amount: 4,
                        targetMapping: "CONTROLLER"
                    }
                ]
            }
        ]
    };



