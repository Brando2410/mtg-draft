import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, DurationType } from '@shared/engine_types';

export const DefendtheCampus: CardDefinition = {
    name: 'Defend the Campus',
    manaCost: '{1}{W}',
    colors: ['W'],
    types: ['Instant'],
    oracleText: 'Choose one —\n• Creatures you control get +1/+1 until end of turn.\n• Destroy target creature with power 4 or greater.',
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [{
                type: EffectType.Choice,
                choices: [
                    {
                        label: "+1/+1 to your creatures",
                        effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.AllCreaturesYouControl, duration: { type: DurationType.UntilEndOfTurn }, powerModifier: 1, toughnessModifier: 1 }]
                    },
                    {
                        label: "Destroy target creature with power 4 or greater",
                        targetDefinition: { count: 1, type: TargetType.Creature, restrictions: ["power >= 4"] },
                        effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
                    }
                ]
            }]
        }
    ]
};

