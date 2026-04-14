import { CardDefinition, AbilityType, EffectType, TargetType } from '@shared/engine_types';

export const FractalAnomaly: CardDefinition = {
    "name": "Fractal Anomaly",
    "manaCost": "{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Create a 0/0 green and blue Fractal creature token and put X +1/+1 counters on it, where X is the number of cards you've drawn this turn.",
    "abilities": [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Fractal',
                        colors: ['G', 'U'],
                        types: ['Creature'],
                        subtypes: ['Fractal'],
                        power: 0,
                        toughness: 0
                    }
                },
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'LAST_CREATED_TOKEN',
                    amount: 'CARDS_DRAWN_THIS_TURN',
                    value: '+1/+1'
                }
            ]
        }
    ]
};
