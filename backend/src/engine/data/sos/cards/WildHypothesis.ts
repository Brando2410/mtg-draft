import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const WildHypothesis: CardDefinition = {
    "name": "Wild Hypothesis",
    "manaCost": "{X}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it.\nSurveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
    "abilities": [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 1,
                    tokenBlueprint: {
                        name: 'Fractal',
                        types: ['Creature'],
                        subtypes: ['Fractal'],
                        colors: ['G', 'U'],
                        power: 0,
                        toughness: 0
                    },
                    startingCounters: { type: '+1/+1', amount: 'X' },
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.Surveil,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
