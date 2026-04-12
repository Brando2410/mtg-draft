import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType } from '@shared/engine_types';

export const EssenceInfusion: ImplementableCard = {
    name: 'Essence Infusion',
    manaCost: '{1}{B}',
    type_line: 'Sorcery',
    types: ['Sorcery'],
    subtypes: [],
    power: '0',
    toughness: '0',
    keywords: [],
    colors: ['black'],
    supertypes: [],
    oracleText: 'Put two +1/+1 counters on target creature. It gains lifelink until end of turn.',
    abilities: [
        {
            id: 'essence_infusion_spell',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Hand,
            effects: [
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'TARGET',
                    amount: 2,
                    value: '+1/+1'
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'TARGET',
                    duration: 'UNTIL_END_OF_TURN',
                    abilitiesToAdd: ['Lifelink']
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
