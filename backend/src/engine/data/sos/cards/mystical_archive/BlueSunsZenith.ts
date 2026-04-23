import { AbilityType, CardDefinition, EffectType, TargetType, TargetMapping, Zone, DynamicAmount } from '@shared/engine_types';

export const BlueSunsZenith: CardDefinition = {
    name: "Blue Sun's Zenith",
    manaCost: "{X}{U}{U}{U}",
    oracleText: "Target player draws X cards. Shuffle Blue Sun's Zenith into its owner's library.",
    colors: ["U"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Player,
                count: 1
            },
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: DynamicAmount.X,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Library,
                    shuffle: true,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ]
};
