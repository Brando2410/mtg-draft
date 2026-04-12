import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const EnvironmentalSciences: ImplementableCard = {
    name: 'Environmental Sciences',
    manaCost: '{2}',
    type_line: 'Sorcery — Lesson',
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    power: undefined,
    toughness: undefined,
    keywords: [],
    colors: [],
    supertypes: [],
    oracleText: "Search your library for a basic land card, reveal it, put it into your hand, then shuffle. You gain 2 life.",
    abilities: [
        {
            id: 'environmental_sciences_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetMapping: 'CONTROLLER',
                    restrictions: ['BasicLand'],
                    reveal: true,
                    destination: Zone.Hand,
                    shuffle: true
                },
                {
                    type: EffectType.GainLife,
                    targetMapping: 'CONTROLLER',
                    amount: 2
                }
            ]
        }
    ]
};

export const ExtendedAnatomy: ImplementableCard = {
    name: 'Extended Anatomy',
    manaCost: '{3}',
    type_line: 'Sorcery — Lesson',
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    power: undefined,
    toughness: undefined,
    keywords: [],
    colors: [],
    supertypes: [],
    oracleText: "Put two +1/+1 counters on target creature. It gains vigilance until end of turn.",
    abilities: [
        {
            id: 'extended_anatomy_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: ['Creature']
            },
            effects: [
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'TARGET_1',
                    amount: 2,
                    value: '+1/+1'
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'TARGET_1',
                    duration: 'UNTIL_END_OF_TURN',
                    abilitiesToAdd: ['Vigilance']
                }
            ]
        }
    ]
};
