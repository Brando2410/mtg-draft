import { AbilityType, CardDefinition, EffectType, TriggerEvent } from '@shared/engine_types';
    export const FractalTender: CardDefinition = {
    name: "Fractal Tender",
    manaCost: "{3}{G}{U}",
    colors: [
        "G",
        "U"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Elf",
        "Wizard"
    ],
    keywords: ["Ward {2}", "Increment"],
    oracleText: "Ward {2}\nIncrement (Whenever you cast a spell, if the amount of mana you spent is greater than this creature's power or toughness, put a +1/+1 counter on this creature.)\nAt the beginning of each end step, if you put a counter on this creature this turn, create a 0/0 green and blue Fractal creature token and put three +1/+1 counters on it.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            condition: 'PUT_COUNTER_ON_SELF_THIS_TURN',
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
                        image_url: 'https://cards.scryfall.io/png/front/9/1/910f48ab-b04e-4874-b31d-a86a7bc5af14.png?1682693894'
                    },
                    amount: 1,
                    startingCounters: {
                        type: '+1/+1',
                        amount: 3
                    }
                }
            ]
        }
    ],
    power: "3",
    toughness: "3"
};
    