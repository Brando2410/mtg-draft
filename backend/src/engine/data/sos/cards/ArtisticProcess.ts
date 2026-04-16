import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping } from '@shared/engine_types';
    export const ArtisticProcess: CardDefinition = {
    name: "Artistic Process",
    manaCost: "{3}{R}{R}",
    colors: [
        "R"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: ['Flying'],
    oracleText: "Choose one —\n• Artistic Process deals 6 damage to target creature.\n• Artistic Process deals 2 damage to each creature you don't control.\n• Create a 3/3 blue and red Elemental creature token with flying. It gains haste until end of turn.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: CostType.Choice,
                    choices: [
                        {
                            label: '6 damage to target creature',
                            effects: [{ type: EffectType.DealDamage, amount: 6, targetMapping: TargetMapping.Target1 }],
                            targetDefinition: { type: 'Creature' }
                        },
                        {
                            label: '2 damage to each creature you don\'t control',
                            effects: [{ type: EffectType.DealDamage, amount: 2, targetMapping: TargetMapping.EachOpponentCreature }]
                        },
                        {
                            label: 'Create 3/3 Elemental with Flying',
                            effects: [
                                {
                                    type: EffectType.CreateToken,
                                    tokenBlueprint: {
                                        name: 'Elemental',
                                        power: '3',
                                        toughness: '3',
                                        colors: ['U', 'R'],
                                        types: ['Creature'],
                                        subtypes: ['Elemental'],
                                        image_url: 'https://cards.scryfall.io/png/front/3/d/3d0b9b88-705e-4df0-8a93-3e240b81355b.png?1682693891'
                                    }
                                },
                                {
                                    type: EffectType.ApplyContinuousEffect,
                                    targetMapping: TargetMapping.LastCreatedToken,
                                    abilitiesToAdd: ['Haste'],
                                    duration: { type: DurationType.UntilEndOfTurn }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
    