import { AbilityType, CardDefinition, CounterType, DynamicAmount, EffectType, TargetMapping } from '@shared/engine_types';
export const FractalAnomaly: CardDefinition = {
    name: "Fractal Anomaly",
    manaCost: "{U}",
    colors: ["U"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Create a 0/0 green and blue Fractal creature token and put X +1/+1 counters on it, where X is the number of cards you've drawn this turn.",
    abilities: [
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
                        image_url: "https://cards.scryfall.io/normal/front/d/e/de564776-9d88-4533-8717-842eecdd0594.jpg?1775828279"
                    },
                    startingCounters: {
                        counterType: CounterType.P1P1,
                        amount: DynamicAmount.CardsDrawnThisTurn
                    }
                }
            ]
        }
    ],
    scryfall_id: "e1975a61-aef0-49a6-a6d6-c3a37e2e2b22",
    image_url: "https://cards.scryfall.io/normal/front/e/1/e1975a61-aef0-49a6-a6d6-c3a37e2e2b22.jpg?1775937257",
    rarity: "uncommon"
};

