import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType, Zone } from '@shared/engine_types';

export const Expel: ImplementableCard = {
    name: 'Expel',
    manaCost: '{2}{W}',
    type_line: 'Instant',
    types: ['Instant'],
    subtypes: [],
    power: undefined,
    toughness: undefined,
    keywords: [],
    colors: ['white'],
    supertypes: [],
    oracleText: 'Exile target tapped creature.',
    abilities: [
        {
            id: 'expel_main',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: ['Creature', 'tapped']
            },
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Exile,
                    targetMapping: 'TARGET_1'
                }
            ]
        }
    ]
};
