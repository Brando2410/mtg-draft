import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const GnarledSage: Record<string, ImplementableCard> = {
    "Gnarled Sage": {
        name: "Gnarled Sage",
        manaCost: "{3}{G}{G}",
        oracleText: "Reach (This creature can block creatures with flying.)\nAs long as you've drawn two or more cards this turn, this creature gets +0/+2 and has vigilance. (Attacking doesn't cause it to tap.)",
        colors: ["green"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Treefolk", "Druid"],
        power: "4",
        toughness: "4",
        keywords: ["Reach"],
        abilities: [
            {
                id: "gnarled_sage_buff",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        toughnessModifier: 2,
                        layer: 7,
                        targetMapping: "SELF",
                        condition: "DRAWN_CARDS_GE:2"
                    },
                    {
                        type: EffectType.ApplyContinuousEffect,
                        abilitiesToAdd: ["Vigilance"],
                        layer: 6,
                        targetMapping: "SELF",
                        condition: "DRAWN_CARDS_GE:2"
                    }
                ],
                oracleText: "As long as you've drawn two or more cards this turn, Gnarled Sage gets +0/+2 and has vigilance."
            }
        ]
    }
};
