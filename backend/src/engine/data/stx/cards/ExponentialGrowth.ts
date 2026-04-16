import { CardDefinition, AbilityType, EffectType, DurationType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const ExponentialGrowth: CardDefinition = {
    name: "Exponential Growth",
    manaCost: "{X}{X}{R}{G}",
    colors: ['R', 'G'],
    types: ["Sorcery"],
    oracleText: "Until end of turn, double target creature's power X times.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.Permanent, count: 1, restrictions: [{ type: 'Type', value: 'Creature' }] },
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: DurationType.UntilEndOfTurn,
                // The engine would need a custom handler for 2^X
                effects: [{ type: 'DoublePowerXTimes', amount: DynamicAmount.X }],
                targetMapping: TargetMapping.Target1
            }]
        }
    ]
};
