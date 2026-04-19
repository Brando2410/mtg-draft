import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping } from '@shared/engine_types';

export const HeroicIntervention: CardDefinition = {
    name: "Heroic Intervention",
    manaCost: "{1}{G}",
    scryfall_id: "43c037e3-7d1a-48ca-8ecc-276696592f62",
    image_url: "https://cards.scryfall.io/normal/front/4/3/43c037e3-7d1a-48ca-8ecc-276696592f62.jpg?1594737038",
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


