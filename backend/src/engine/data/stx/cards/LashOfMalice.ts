import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType } from '@shared/engine_types';

export const LashOfMalice: ImplementableCard = {
    name: 'Lash of Malice',
    manaCost: '{B}',
    type_line: 'Instant',
    types: ['Instant'],
    subtypes: [],
    power: '0',
    toughness: '0',
    keywords: [],
    colors: ['black'],
    supertypes: [],
    oracleText: 'Target creature gets +2/-2 until end of turn.',
    abilities: [
        {
            id: 'lash_of_malice_spell',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Hand,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'TARGET',
                    duration: 'UNTIL_END_OF_TURN',
                    powerModifier: 2,
                    toughnessModifier: -2
                }
            ],
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: ['Creature']
            }
        }
    ]
};
