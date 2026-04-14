import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount, Restriction } from '@shared/engine_types';

export const VanishingVerse: CardDefinition = {
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
    };
