import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType, Zone, TriggerEvent } from '@shared/engine_types';

/**
 * STRIXHAVEN BATCH: LEARN CARDS 2
 */

export const StudyBreak: ImplementableCard = {
    name: 'Study Break',
    manaCost: '{1}{W}',
    type_line: 'Instant',
    types: ['Instant'],
    subtypes: [],
    colors: ['white'],
    oracleText: "Tap up to two target creatures. Learn.",
    abilities: [
        {
            id: 'study_break_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 2,
                restrictions: ['Creature'],
                minCount: 0
            },
            effects: [
                { type: EffectType.Tap, targetMapping: 'ALL_TARGETS' },
                { type: EffectType.Learn }
            ]
        }
    ]
};

export const CramSession: ImplementableCard = {
    name: 'Cram Session',
    manaCost: '{1}{B/G}',
    type_line: 'Sorcery',
    types: ['Sorcery'],
    subtypes: [],
    colors: ['black', 'green'],
    oracleText: "You gain 4 life. Learn.",
    abilities: [
        {
            id: 'cram_session_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                { type: EffectType.GainLife, amount: 4, targetMapping: 'CONTROLLER' },
                { type: EffectType.Learn }
            ]
        }
    ]
};

export const EnthusiasticStudy: ImplementableCard = {
    name: 'Enthusiastic Study',
    manaCost: '{1}{R}',
    type_line: 'Instant',
    types: ['Instant'],
    subtypes: [],
    colors: ['red'],
    oracleText: "Target creature gets +3/+1 and gains trample until end of turn. Learn.",
    abilities: [
        {
            id: 'enthusiastic_study_spell',
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
                    powerModifier: 3,
                    toughnessModifier: 1,
                    abilitiesToAdd: ['Trample'],
                    targetMapping: 'TARGET_1'
                },
                { type: EffectType.Learn }
            ]
        }
    ]
};

export const HuntForSpecimens: ImplementableCard = {
    name: 'Hunt for Specimens',
    manaCost: '{1}{B}',
    type_line: 'Sorcery',
    types: ['Sorcery'],
    subtypes: [],
    colors: ['black'],
    oracleText: "Create a 1/1 black and green Pest creature token with \"When this creature dies, you gain 1 life.\" Learn.",
    abilities: [
        {
            id: 'hunt_for_specimens_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 1,
                    tokenBlueprint: {
                        name: 'Pest',
                        power: '1', toughness: '1',
                        colors: ['black', 'green'],
                        types: ['Creature'],
                        subtypes: ['Pest'],
                        abilities: [{
                            id: 'pest_death_trigger_hunt',
                            type: AbilityType.Triggered,
                            triggerEvent: TriggerEvent.Death,
                            triggerCondition: 'SELF',
                            effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: 'CONTROLLER' }]
                        }]
                    }
                },
                { type: EffectType.Learn }
            ]
        }
    ]
};

export const Eyetwitch: ImplementableCard = {
    name: 'Eyetwitch',
    manaCost: '{B}',
    type_line: 'Creature — Eye Bat',
    types: ['Creature'],
    subtypes: ['Eye', 'Bat'],
    power: '1',
    toughness: '1',
    keywords: ['Flying'],
    colors: ['black'],
    oracleText: "Flying\nWhen Eyetwitch dies, learn.",
    abilities: [
        {
            id: 'eyetwitch_death_trigger',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Death,
            triggerCondition: 'SELF',
            effects: [{ type: EffectType.Learn }]
        }
    ]
};

export const RiseOfExtus: ImplementableCard = {
    name: 'Rise of Extus',
    manaCost: '{4}{W/B}{W/B}',
    type_line: 'Sorcery',
    types: ['Sorcery'],
    subtypes: [],
    colors: ['white', 'black'],
    oracleText: "Exile target nonland permanent. Learn.",
    abilities: [
        {
            id: 'rise_of_extus_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: ['Nonland']
            },
            effects: [
                { type: EffectType.Exile, targetMapping: 'TARGET_1' },
                { type: EffectType.Learn }
            ]
        }
    ]
};
