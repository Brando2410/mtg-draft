import { AbilityType, ZoneRequirement, EffectType, CardDefinition, DurationType, TargetMapping } from '@shared/engine_types';

export const BurnBright: CardDefinition = {

    name: "Burn Bright",
    manaCost: "{2}{R}",
    oracleText: "Creatures you control get +2/+0 until end of turn.",
    colors: ["R"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            id: "burn_bright_spell",
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [{ type: EffectType.ApplyContinuousEffect, powerModifier: 2, toughnessModifier: 0, duration: DurationType.UntilEndOfTurn, layer: 7, targetMapping: TargetMapping.AllCreaturesYouControl }]
        }
    ]

};
