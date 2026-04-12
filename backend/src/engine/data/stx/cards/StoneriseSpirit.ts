import { AbilityType, ImplementableCard, ZoneRequirement, EffectType } from '@shared/engine_types';

export const StoneriseSpirit: ImplementableCard = {
    name: 'Stonerise Spirit',
    manaCost: '{1}{W}',
    type_line: 'Creature — Spirit Bird',
    types: ['Creature'],
    subtypes: ['Spirit', 'Bird'],
    power: '1',
    toughness: '2',
    keywords: ['Flying'],
    colors: ['white'],
    supertypes: [],
    oracleText: 'Flying. {4}, Exile Stonerise Spirit from your graveyard: Target creature gains flying until end of turn.',
    abilities: [
        {
            id: 'stonerise_spirit_activated',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Graveyard,
            costs: [{ type: 'Mana', value: '{4}' }, { type: 'Sacrifice', restrictions: ['SELF'] }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'TARGET',
                    duration: 'UNTIL_END_OF_TURN',
                    abilitiesToAdd: ['Flying']
                }
            ],
            targetDefinition: {
                type: 'Permanent',
                count: 1,
                restrictions: ['Creature']
            }
        }
    ]
};
