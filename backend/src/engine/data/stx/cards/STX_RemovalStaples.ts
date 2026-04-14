import { CardDefinition, AbilityType, EffectType, TargetType, TargetMapping, Restriction } from '@shared/engine_types';

export const STX_RemovalStaples: CardDefinition[] = [
    {
        name: 'Fracture',
        manaCost: '{W}{B}',
        colors: ['W', 'B'],
        types: ['Instant'],
        oracleText: "Destroy target artifact, enchantment, or planeswalker.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: TargetType.Permanent,
                    count: 1,
                    restrictions: [Restriction.Artifact, Restriction.Enchantment, Restriction.Planeswalker]
                },
                effects: [
                    {
                        type: EffectType.Destroy,
                        targetMapping: TargetMapping.Target1
                    }
                ]
            }
        ]
    },
    {
        name: 'Vanishing Verse',
        manaCost: '{W}{B}',
        colors: ['W', 'B'],
        types: ['Instant'],
        oracleText: "Exile target monocolored permanent.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: TargetType.Permanent,
                    count: 1,
                    restrictions: [Restriction.Monocolored]
                },
                effects: [
                    {
                        type: EffectType.Exile,
                        targetMapping: TargetMapping.Target1
                    }
                ]
            }
        ]
    },
    {
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
                                label: '3 Damage to creature or planeswalker',
                                targetDefinition: { 
                                    type: TargetType.CreatureOrPlaneswalker, 
                                    count: 1
                                },
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
                                targetDefinition: { 
                                    type: TargetType.ArtifactOrEnchantment, 
                                    count: 1
                                },
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
    }
];
