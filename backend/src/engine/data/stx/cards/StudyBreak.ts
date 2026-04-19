import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const StudyBreak: CardDefinition = {
    name: 'Study Break',
    manaCost: '{1}{W}',
    colors: ['W'],
    types: ['Instant'],
    oracleText: "Tap up to two target creatures. Learn.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                count: 2,
                type: TargetType.Creature,
                minCount: 0
            },
            effects: [
                { type: EffectType.Tap, targetMapping: TargetMapping.TargetAll },
                { type: EffectType.Learn }
            ]
        }
    ]
};

