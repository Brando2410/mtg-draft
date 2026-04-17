import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';
export const AjanisResponse: CardDefinition = {
    name: "Ajani's Response",
    manaCost: "{4}{W}",
    colors: [
        "W"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "This spell costs {3} less to cast if it targets a tapped creature.\nDestroy target creature.",
    abilities: [
        {
            type: AbilityType.Static,
            activeZone: Zone.Hand,
            effects: [
                {
                    type: EffectType.CostReduction,
                    amount: 3,
                    targetMapping: TargetMapping.Self,
                    condition: ConditionType.TargetsTappedCreature
                }
            ]
        },
        {
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.Creature },
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
