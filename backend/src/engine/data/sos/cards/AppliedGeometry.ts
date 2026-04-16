import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping } from '@shared/engine_types';
    export const AppliedGeometry: CardDefinition = {
    name: "Applied Geometry",
    manaCost: "{2}{G}{U}",
    colors: [
        "G",
        "U"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Create a token that's a copy of target non-Aura permanent you control, except it's a 0/0 Fractal creature in addition to its other types. Put six +1/+1 counters on it.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { 
                type: 'Permanent', 
                restrictions: [Restriction.YouControl, { type: 'NotSubtype', value: 'Aura' }] 
            },
            effects: [
                {
                    type: EffectType.CreateTokenCopy,
                    targetMapping: TargetMapping.Target1,
                    typesToAdd: ['Creature'],
                    subtypesToAdd: ['Fractal'],
                    powerOverride: "0",
                    toughnessOverride: "0"
                },
                {
                    type: EffectType.AddCounters,
                    targetMapping: TargetMapping.LastCreatedToken,
                    amount: 6,
                    counterType: '+1/+1'
                }
            ]
        }
    ]
};
    