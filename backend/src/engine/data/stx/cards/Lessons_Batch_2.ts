import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType } from '@shared/engine_types';

export const InklingSummoning: ImplementableCard = {
    name: 'Inkling Summoning',
    manaCost: '{2}{W/B}{W/B}',
    type_line: 'Sorcery — Lesson',
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    colors: ['white', 'black'],
    oracleText: "Create a 2/1 white and black Inkling creature token with flying.",
    abilities: [
        {
            id: 'inkling_summoning_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                {
                    type: EffectType.CreateToken,
                    targetMapping: 'CONTROLLER',
                    amount: 1,
                    tokenBlueprint: {
                        name: 'Inkling',
                        power: '2', toughness: '1',
                        colors: ['white', 'black'],
                        types: ['Creature'],
                        subtypes: ['Inkling'],
                        keywords: ['Flying']
                    }
                }
            ]
        }
    ]
};

export const ElementalSummoning: ImplementableCard = {
    name: 'Elemental Summoning',
    manaCost: '{3}{U/R}{U/R}',
    type_line: 'Sorcery — Lesson',
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    colors: ['blue', 'red'],
    oracleText: "Create a 4/4 blue and red Elemental creature token.",
    abilities: [
        {
            id: 'elemental_summoning_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                {
                    type: EffectType.CreateToken,
                    targetMapping: 'CONTROLLER',
                    amount: 1,
                    tokenBlueprint: {
                        name: 'Elemental',
                        power: '4', toughness: '4',
                        colors: ['blue', 'red'],
                        types: ['Creature'],
                        subtypes: ['Elemental']
                    }
                }
            ]
        }
    ]
};

export const SpiritSummoning: ImplementableCard = {
    name: 'Spirit Summoning',
    manaCost: '{1}{R/W}{R/W}',
    type_line: 'Sorcery — Lesson',
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    colors: ['red', 'white'],
    oracleText: "Create a 3/2 red and white Spirit creature token.",
    abilities: [
        {
            id: 'spirit_summoning_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                {
                    type: EffectType.CreateToken,
                    targetMapping: 'CONTROLLER',
                    amount: 1,
                    tokenBlueprint: {
                        name: 'Spirit',
                        power: '3', toughness: '2',
                        colors: ['red', 'white'],
                        types: ['Creature'],
                        subtypes: ['Spirit']
                    }
                }
            ]
        }
    ]
};

export const PestSummoning: ImplementableCard = {
    name: 'Pest Summoning',
    manaCost: '{1}{B/G}{B/G}',
    type_line: 'Sorcery — Lesson',
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    colors: ['black', 'green'],
    oracleText: "Create two 1/1 black and green Pest creature tokens with \"When this creature dies, you gain 1 life.\"",
    abilities: [
        {
            id: 'pest_summoning_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                {
                    type: EffectType.CreateToken,
                    targetMapping: 'CONTROLLER',
                    amount: 2,
                    tokenBlueprint: {
                        name: 'Pest',
                        power: '1', toughness: '1',
                        colors: ['black', 'green'],
                        types: ['Creature'],
                        subtypes: ['Pest'],
                        oracleText: 'When this creature dies, you gain 1 life.',
                        abilities: [
                            {
                                id: 'pest_death_trigger_lesson',
                                type: AbilityType.Triggered,
                                triggerEvent: 'ON_DEATH',
                                triggerCondition: (state: any, event: any, source: any) => event.targetId === source.sourceId,
                                effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: 'CONTROLLER' }]
                            }
                        ]
                    }
                }
            ]
        }
    ]
};
