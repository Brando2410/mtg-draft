import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping } from "@shared/engine_types";

export const GnarledSage: CardDefinition = {
    name: "Gnarled Sage",
    manaCost: "{3}{G}{G}",
    oracleText: "Reach (This creature can block creatures with flying.)\nAs long as you've drawn two or more cards this turn, this creature gets +0/+2 and has vigilance. (Attacking doesn't cause it to tap.)",
    colors: ["G"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Treefolk", "Druid"],
    power: "4",
    toughness: "4",
    keywords: ["Reach"],
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    toughnessModifier: 2,
                    layer: 7,
                    targetMapping: TargetMapping.Self,
                    condition: `${ConditionType.DrawnCardsGe}:2`
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    abilitiesToAdd: ["Vigilance"],
                    layer: 6,
                    targetMapping: TargetMapping.Self,
                    condition: `${ConditionType.DrawnCardsGe}:2`
                }
            ],
        }
    ]
};
