import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const TogetherasOne: CardDefinition = {
    name: "Together as One",
    manaCost: "{6}",
    colors: [],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Converge — Target player draws X cards, Together as One deals X damage to any target, and you gain X life, where X is the number of colors of mana spent to cast this spell.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: [
                { type: TargetType.Player, label: 'Target player' },
                { type: TargetType.AnyTarget, label: 'Any target' }
            ],
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: DynamicAmount.ConvergeAmount,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.DealDamage,
                    amount: DynamicAmount.ConvergeAmount,
                    targetMapping: TargetMapping.Target2
                },
                {
                    type: EffectType.GainLife,
                    amount: DynamicAmount.ConvergeAmount,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
    
