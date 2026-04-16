import { AbilityType, ZoneRequirement, CardDefinition, TargetType, TargetMapping, DurationType, EffectType } from '@shared/engine_types';

export const DefiantStrike: CardDefinition = {

    name: "Defiant Strike",
    manaCost: "{W}",
    oracleText: "Target creature gets +1/+0 until end of turn.\nDraw a card.",
    colors: ["white"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            id: "defiant_strike_spell",
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            targetDefinition: { type: TargetType.Creature, count: 1 },
            effects: [
                { type: EffectType.ApplyContinuousEffect, powerModifier: 1, toughnessModifier: 0, duration: DurationType.UntilEndOfTurn, layer: 7, targetMapping: TargetMapping.Target1 },
                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        }
    ]

};
