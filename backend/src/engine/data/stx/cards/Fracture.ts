import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType } from '@shared/engine_types';

export const Fracture: ImplementableCard = {
    name: 'Fracture',
    manaCost: '{W}{B}',
    type_line: 'Instant',
    types: ['Instant'],
    subtypes: [],
    power: '0',
    toughness: '0',
    keywords: [],
    colors: ['white', 'black'],
    supertypes: [],
    oracleText: 'Destroy target artifact, enchantment, or planeswalker.',
    abilities: [
        {
            id: 'fracture_spell',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Hand,
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: 'TARGET'
                }
            ],
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: ['Artifact', 'Enchantment', 'Planeswalker']
            }
        }
    ]
};
