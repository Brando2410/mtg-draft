import { AbilityType, ZoneRequirement, CardDefinition, EffectType, TargetType, DurationType, TargetMapping } from "@shared/engine_types";

export const RangersGuile: CardDefinition = {
    name: "Ranger's Guile",
    manaCost: "{G}",
    oracleText: "Target creature you control gets +1/+1 and gains hexproof until end of turn. (It can't be the target of spells or abilities your opponents control.)",
    colors: ["G"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            id: "rangers_guile_spell",
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Hand,
            targetDefinition: { type: TargetType.Creature, count: 1, restrictions: ['YouControl'] },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 7,
                    powerModifier: 1,
                    toughnessModifier: 1,
                    duration: DurationType.UntilEndOfTurn,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 6,
                    abilitiesToAdd: ['Hexproof'],
                    duration: DurationType.UntilEndOfTurn,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
