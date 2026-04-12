import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, Zone } from '@shared/engine_types';

export const EurekaMoment: ImplementableCard = {
    name: 'Eureka Moment',
    manaCost: '{2}{G}{U}',
    type_line: 'Instant',
    types: ['Instant'],
    subtypes: [],
    power: '0',
    toughness: '0',
    keywords: [],
    colors: ['green', 'blue'],
    supertypes: [],
    oracleText: 'Draw two cards. You may put a land card from your hand onto the battlefield.',
    abilities: [
        {
            id: 'eureka_moment_spell',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Hand,
            effects: [
                {
                    type: EffectType.DrawCards,
                    targetMapping: 'SELF',
                    amount: 2
                },
                {
                    type: EffectType.PutOnBattlefield,
                    selectionType: 'Search',
                    sourceZones: [Zone.Hand],
                    destination: Zone.Battlefield,
                    restrictions: ['Land'],
                    optional: true,
                    label: 'Put a land card onto the battlefield?'
                }
            ]
        }
    ]
};
