import { CardDefinition, AbilityType, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const AjanisResponse: CardDefinition = {
    "name": "Ajani's Response",
    "manaCost": "{4}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "This spell costs {3} less to cast if it targets a tapped creature.\nDestroy target creature.",
    "abilities": [
        {
            type: AbilityType.Static,
            activeZone: Zone.Hand,
            effects: [
                {
                    type: 'CostReduction',
                    amount: 3,
                    targetMapping: 'SELF',
                    condition: 'TARGETS_TAPPED_CREATURE'
                }
            ]
        },
        {
            type: AbilityType.Spell,
            targetDefinition: { type: 'Creature' },
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};


