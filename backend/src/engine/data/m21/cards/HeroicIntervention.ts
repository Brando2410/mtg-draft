import { AbilityType, CardDefinition, EffectType, DurationType, TargetMapping } from '@shared/engine_types';

export const HeroicIntervention: CardDefinition = {
    name: "Heroic Intervention",
    manaCost: "{1}{G}",
    oracleText: "Permanents you control gain hexproof and indestructible until end of turn.",
    colors: ["G"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                { type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Hexproof', 'Indestructible'], layer: 6, targetMapping: TargetMapping.AllMatchingPermanentsYouControl }
            ]
        }
    ]
};


