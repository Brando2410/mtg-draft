import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const PrismariCommand: CardDefinition = {
    name: 'Prismari Command',
    manaCost: '{1}{U}{R}',
    colors: ['U', 'R'],
    types: ['Instant'],
    oracleText: 'Choose two —\n• Prismari Command deals 2 damage to any target.\n• Target player draws two cards, then discards two cards.\n• Create a Treasure token.\n• Destroy target artifact.',
    abilities: [{
        type: AbilityType.Spell,
        effects: [{
            type: EffectType.Choice,
            label: 'Choose two',
            minChoices: 2,
            maxChoices: 2,
            choices: [
                {
                    label: 'Deal 2 damage to any target',
                    targetDefinition: { count: 1, type: TargetType.AnyTarget },
                    effects: [{ type: EffectType.DealDamage, amount: 2, targetMapping: TargetMapping.Target1 }]
                },
                {
                    label: 'Target player draws 2, discards 2',
                    targetDefinition: { count: 1, type: TargetType.Player },
                    effects: [{ type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Target1 }, { type: EffectType.DiscardCards, amount: 2, targetMapping: TargetMapping.Target1 }]
                },
                {
                    label: 'Create a Treasure token',
                    effects: [{ type: EffectType.CreateToken, tokenBlueprint: { name: 'Treasure', colors: [], types: ['Artifact', 'Token'], subtypes: ['Treasure'], oracleText: '{T}, Sacrifice this artifact: Add one mana of any color.' } }]
                },
                {
                    label: 'Destroy target artifact',
                    targetDefinition: { count: 1, type: TargetType.Artifact },
                    effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
                }
            ]
        }]
    }]
};

