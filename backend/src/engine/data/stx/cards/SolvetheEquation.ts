import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const SolvetheEquation: CardDefinition = {
    name: 'Solve the Equation',
    manaCost: '{2}{U}',
    colors: ['U'],
    types: ['Sorcery'],
    oracleText: "Search your library for an instant or sorcery card, reveal it, put it into your hand, then shuffle.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetDefinition: {
                        type: TargetType.InstantOrSorcery,
                        count: 1,
                    },
                    zone: Zone.Hand,
                    reveal: true,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};

