import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping } from '@shared/engine_types';

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
                    targetMapping: TargetMapping.Controller,
                    amount: 1,
                    tokenBlueprint: {
                        name: "Fractal",
                        colors: ["G", "U"],
                        types: ["Creature"],
                        subtypes: ["Fractal"],
                        power: 0,
                        toughness: 0,
                        image_url: "https://cards.scryfall.io/png/front/9/1/910f48ab-b04e-4874-b31d-a86a7bc5af14.png?1682693894"
                    },
                    startingCounters: {
                        type: 'p1p1',
                        amount: DynamicAmount.CardsDrawnThisTurn
                    }
                }
            ]
        }
    ]
};



