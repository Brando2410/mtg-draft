import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const ArtisticProcess: CardDefinition = {
    name: "Artistic Process",
    manaCost: "{3}{R}{R}",
    scryfall_id: "bce9d933-be58-4301-beb4-07b04d0b69f0",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/b/c/bce9d933-be58-4301-beb4-07b04d0b69f0.jpg?1775937683",
    colors: ["R"],
    types: ["Sorcery"],
    oracleText: "Choose one —\n• Artistic Process deals 6 damage to target creature.\n• Artistic Process deals 2 damage to each creature you don't control.\n• Create a 3/3 blue and red Elemental creature token with flying. It gains haste until end of turn.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.Choice,
                    choices: [
                        {
                            label: 'Deals 6 damage to target creature',
                            targetDefinition: { type: TargetType.Creature, count: 1 },
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
                                        image_url: 'https://cards.scryfall.io/png/front/3/d/3d0b9b88-705e-4df0-8a93-3e240b81355b.png?1682693891'
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
            ]
        }
    ]
};
