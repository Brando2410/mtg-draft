import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const Flunk: ImplementableCard = {
    name: 'Flunk',
    manaCost: '{1}{B}',
    type_line: 'Instant',
    types: ['Instant'],
    subtypes: [],
    power: undefined,
    toughness: undefined,
    keywords: [],
    colors: ['black'],
    supertypes: [],
    oracleText: 'Target creature gets -X/-X until end of turn, where X is 7 minus the number of cards in that creature’s controller’s hand.',
    abilities: [
        {
            id: 'flunk_main',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: ['Creature']
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: 'UNTIL_END_OF_TURN',
                    powerModifier: 'TARGET_HAND_SIZE_7_MINUS',
                    toughnessModifier: 'TARGET_HAND_SIZE_7_MINUS',
                    targetMapping: 'TARGET_1'
                }
            ]
        }
    ]
};
