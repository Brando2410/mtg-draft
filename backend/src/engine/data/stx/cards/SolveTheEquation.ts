import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType, Zone } from '@shared/engine_types';

export const SolveTheEquation: ImplementableCard = {
    name: 'Solve the Equation',
    manaCost: '{2}{U}',
    type_line: 'Sorcery',
    types: ['Sorcery'],
    subtypes: [],
    colors: ['blue'],
    oracleText: "Search your library for an instant or sorcery card, reveal it, put it into your hand, then shuffle.",
    abilities: [
        {
            id: 'solve_the_equation_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetMapping: 'CONTROLLER',
                    restrictions: ['Instant_OR_Sorcery'],
                    reveal: true,
                    destination: Zone.Hand,
                    shuffle: true
                }
            ]
        }
    ]
};
