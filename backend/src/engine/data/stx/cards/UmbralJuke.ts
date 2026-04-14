import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const UmbralJuke: CardDefinition = {
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
                        restrictions: [TargetType.CreatureOrPlaneswalker]
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
    };
