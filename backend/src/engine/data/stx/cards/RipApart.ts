import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const RipApart: CardDefinition = {
    name: 'Rip Apart',
    manaCost: '{R}{W}',
    colors: ['R', 'W'],
    types: ['Sorcery'],
    oracleText: "Choose one —\n• Rip Apart deals 3 damage to target creature or planeswalker.\n• Destroy target artifact or enchantment.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.Choice,
                    label: 'Choose Mode',
                    choices: [
                        {
                            label: 'Deal 3 Damage to target creature or planeswalker',
                            targetDefinitions: [{
                                type: TargetType.Permanent,
                                count: 1,
                                restrictions: [Restriction.CreatureOrPlaneswalker]
                            }],
                            effects: [
                                {
                                    type: EffectType.DealDamage,
                                    amount: 3,
                                    targetMapping: TargetMapping.Target1
                                }
                            ]
                        },
                        {
                            label: 'Destroy artifact or enchantment',
                            targetDefinitions: [{
                                type: TargetType.Permanent,
                                count: 1,
                                restrictions: [Restriction.ArtifactOrEnchantment]
                            }],
                            effects: [
                                {
                                    type: EffectType.Destroy,
                                    targetMapping: TargetMapping.Target1
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
