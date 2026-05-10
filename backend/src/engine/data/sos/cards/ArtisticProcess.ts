import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const ArtisticProcess: CardDefinition = {
    name: "Artistic Process",
    manaCost: "{3}{R}{R}",


    colors: ["R"],
    types: ["Sorcery"],
    oracleText: "Choose one —\n• Artistic Process deals 6 damage to target creature.\n• Artistic Process deals 2 damage to each creature you don't control.\n• Create a 3/3 blue and red Elemental creature token with flying. It gains haste until end of turn.",
    abilities: [
        {
            type: AbilityType.Spell,
            modes: [
                {
                    label: 'Deals 6 damage to target creature',
                    targetDefinitions: [{ type: TargetType.Creature, count: 1 }],
                    effects: [{ type: EffectType.DealDamage, amount: 6, targetMapping: TargetMapping.Target1 }]
                },
                {
                    label: 'Deals 2 damage to each creature you don\'t control',
                    effects: [{ type: EffectType.DealDamage, amount: 2, targetMapping: TargetMapping.EachOpponentCreature }]
                },
                {
                    label: 'Create a 3/3 blue and red Elemental creature token with flying. It gains haste until end of turn.',
                    effects: [
                        {
                            type: EffectType.CreateToken,
                            amount: 1,
                            tokenBlueprint: {
                                name: 'Elemental',
                                power: 3,
                                toughness: 3,
                                colors: ['U', 'R'],
                                types: ['Creature'],
                                subtypes: ['Elemental'],
                                keywords: ['Flying'],
                                image_url: "https://cards.scryfall.io/normal/front/5/7/57b98846-85e3-47c7-a903-29953d0b0e8a.jpg?1775828504"
                            }
                        },
                        {
                            type: EffectType.ApplyContinuousEffect,
                            targetMapping: TargetMapping.LastCreatedToken,
                            keywordsToAdd: ['Haste'],
                            duration: { type: DurationType.UntilEndOfTurn }
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "bce9d933-be58-4301-beb4-07b04d0b69f0",
    image_url: "https://cards.scryfall.io/normal/front/b/5/b5b2df9c-228f-4441-a962-46b335bb356e.jpg?1775828255",
    rarity: "uncommon"
};

