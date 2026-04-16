import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const SwiftResponse: CardDefinition = {
    name: "Swift Response",
    manaCost: "{1}{W}",
    oracleText: "Destroy target tapped creature.",
    colors: ["W"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
                restrictions: ['Tapped']
            },
            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
        }
    ]
};


