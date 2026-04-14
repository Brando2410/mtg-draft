import { CardDefinition, AbilityType, EffectType, TargetMapping, DurationType } from '@shared/engine_types';

export const ArtisticProcess: CardDefinition = {
    "name": "Artistic Process",
    "manaCost": "{3}{R}{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Choose one —\n• Artistic Process deals 6 damage to target creature.\n• Artistic Process deals 2 damage to each creature you don't control.\n• Create a 3/3 blue and red Elemental creature token with flying. It gains haste until end of turn.",
    "abilities": [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: 'Choice',
                    choices: [
                        {
                            label: '6 damage to target creature',
                            effects: [{ type: EffectType.DealDamage, amount: 6, targetMapping: 'TARGET_1' }],
                            targetDefinition: { type: 'Creature' }
                        },
                        {
                            label: '2 damage to each creature you don\'t control',
                            effects: [{ type: EffectType.DealDamage, amount: 2, targetMapping: 'EACH_OPPONENT_CREATURE' }]
                        },
                        {
                            label: 'Create 3/3 Elemental with Flying',
                            effects: [
                                {
                                    type: EffectType.CreateToken,
                                    blueprint: {
                                        name: 'Elemental',
                                        power: '3',
                                        toughness: '3',
                                        colors: ['U', 'R'],
                                        types: ['Creature'],
                                        subtypes: ['Elemental'],
                                        keywords: ['Flying']
                                    }
                                },
                                {
                                    type: EffectType.ApplyContinuousEffect,
                                    targetMapping: 'LAST_CREATED_TOKEN',
                                    abilitiesToAdd: ['Haste'],
                                    duration: DurationType.UntilEndOfTurn
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
