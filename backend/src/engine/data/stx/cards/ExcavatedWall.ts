import { AbilityType, ImplementableCard, ZoneRequirement, EffectType } from '@shared/engine_types';

export const ExcavatedWall: ImplementableCard = {
    name: 'Excavated Wall',
    manaCost: '{1}',
    type_line: 'Artifact Creature — Wall',
    types: ['Artifact', 'Creature'],
    subtypes: ['Wall'],
    power: '0',
    toughness: '4',
    keywords: ['Defender'],
    colors: [],
    supertypes: [],
    oracleText: 'Defender\n{1}, {T}: Mill a card.',
    abilities: [
        {
            id: 'excavated_wall_mill',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [
                { type: 'Mana', value: '{1}' },
                { type: 'Tap' }
            ],
            effects: [
                {
                    type: EffectType.Mill,
                    targetMapping: 'SELF',
                    amount: 1
                }
            ]
        }
    ]
};
