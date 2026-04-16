import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const STX_Batch_11_UncommonMix: CardDefinition[] = [
    {
        name: 'Academic Dispute',
        manaCost: '{R}',
        colors: ['R'],
        types: ['Instant'],
        oracleText: "Target creature blocks this turn if able. Target creature gets +1/+0 and gains reach until end of turn. Learn.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: TargetType.Permanent,
                    count: 1,
                    restrictions: [{ type: 'Type', value: 'Creature' }]
                },
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        duration: 'UNTIL_END_OF_TURN',
                        // MustBlockThisTurn is an effect property or ability
                        effects: [{ type: 'MustBlockThisTurn' }],
                        powerModifier: 1,
                        abilitiesToAdd: ['Reach'],
                        targetMapping: TargetMapping.Target1
                    },
                    { type: EffectType.Learn }
                ]
            }
        ]
    },
    {
        name: 'Igneous Inspiration',
        manaCost: '{2}{R}',
        colors: ['R'],
        types: ['Sorcery'],
        oracleText: "Igneous Inspiration deals 3 damage to any target. Learn.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: TargetType.AnyTarget,
                    count: 1
                },
                effects: [
                    { type: EffectType.DealDamage, amount: 3, targetMapping: TargetMapping.Target1 },
                    { type: EffectType.Learn }
                ]
            }
        ]
    },
    {
        name: 'Go Blank',
        manaCost: '{2}{B}',
        colors: ['B'],
        types: ['Sorcery'],
        oracleText: "Target player discards two cards. Then exile that player's graveyard.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: TargetType.Player,
                    count: 1
                },
                effects: [
                    { type: EffectType.DiscardCards, amount: 2, targetMapping: TargetMapping.Target1 },
                    { type: EffectType.Exile, targetMapping: TargetMapping.Target1, sourceZone: Zone.Graveyard }
                ]
            }
        ]
    },
    {
        name: 'Umbral Juke',
        manaCost: '{2}{B}',
        colors: ['B'],
        types: ['Instant'],
        oracleText: "Each opponent sacrifices a creature or planeswalker. If you cast this spell during your main phase, create a 2/1 white and black Inkling creature token with flying.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    { 
                        type: EffectType.Sacrifice, 
                        targetMapping: TargetMapping.EachOpponent, 
                        restriction: { type: 'Any', restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Type', value: 'Planeswalker' }] }
                    },
                    {
                        type: EffectType.CreateToken,
                        condition: 'CastDuringMainPhase',
                        tokenBlueprint: {
                            name: 'Inkling',
                            power: "2", 
                            toughness: "1",
                            colors: ['W', 'B'],
                            types: ['Creature', 'Token'],
                            subtypes: ['Inkling'],
                            keywords: ['Flying']
                        }
                    }
                ]
            }
        ]
    }
];

