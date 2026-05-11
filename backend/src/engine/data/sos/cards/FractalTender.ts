import { AbilityType, CardDefinition, ConditionType, CounterType, EffectType, TriggerEvent } from '@shared/engine_types';
export const FractalTender: CardDefinition = {
    name: "Fractal Tender",
    manaCost: "{3}{G}{U}",
    power: "3",
    toughness: "3",
    colors: ["G", "U"],
    types: ["Creature"],
    subtypes: ["Elf", "Wizard"],
    keywords: ["Ward {2}", "Increment"],
    oracleText: "Ward {2}\nIncrement (Whenever you cast a spell, if the amount of mana you spent is greater than this creature's power or toughness, put a +1/+1 counter on this creature.)\nAt the beginning of each end step, if you put a counter on this creature this turn, create a 0/0 green and blue Fractal creature token and put three +1/+1 counters on it.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            condition: ConditionType.PutCounterOnSelfThisTurn,
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Fractal',
                        types: ['Creature'],
                        subtypes: ['Fractal'],
                        colors: ['G', 'U'],
                        power: '0',
                        toughness: '0',
                        image_url: "https://cards.scryfall.io/normal/front/d/e/de564776-9d88-4533-8717-842eecdd0594.jpg?1775828279"
                    },
                    amount: 1,
                    startingCounters: {
                        counterType: CounterType.P1P1,
                        amount: 3
                    }
                }
            ]
        }
    ],
    scryfall_id: "ea7f5262-4ddb-410a-be72-4bac6af9b4ec",
    image_url: "https://cards.scryfall.io/normal/front/e/a/ea7f5262-4ddb-410a-be72-4bac6af9b4ec.jpg?1775938318",
    rarity: "uncommon"
};

