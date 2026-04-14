import { CardDefinition, AbilityType, EffectType, TargetMapping, DynamicAmount } from '@shared/engine_types';

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
                    amount: 1,
                    tokenBlueprint: {
                        name: 'Fractal',
                        colors: ['green', 'blue'],
                        types: ['Creature'],
                        subtypes: ['Fractal'],
                        power: 0,
                        toughness: 0,
                        oracleText: ''
                    },
                    next: {
                        type: EffectType.AddCounters,
                        counterType: '+1/+1',
                        amount: DynamicAmount.CardsDrawnThisTurn,
                        targetMapping: TargetMapping.LastCreatedToken
                    }
                }
            ]
        }
    ],
};
