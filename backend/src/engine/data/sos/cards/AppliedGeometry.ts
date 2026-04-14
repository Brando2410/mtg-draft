import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const AppliedGeometry: CardDefinition = {
    "name": "Applied Geometry",
    "manaCost": "{2}{G}{U}",
    "colors": [
        "G",
        "U"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Create a token that's a copy of target non-Aura permanent you control, except it's a 0/0 Fractal creature in addition to its other types. Put six +1/+1 counters on it.",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: { 
                type: 'Permanent', 
                controller: 'player', 
                restrictions: [{ type: 'NotSubtype', value: 'Aura' }] 
            },
            effects: [
                {
                    type: 'CreateTokenCopy',
                    targetMapping: TargetMapping.Target1,
                    typesToAdd: ['Creature'],
                    subtypesToAdd: ['Fractal'],
                    powerOverride: "0",
                    toughnessOverride: "0"
                },
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'LAST_CREATED_TOKEN',
                    amount: 6,
                    value: 'p1p1'
                }
            ]
        }
    ]
};


