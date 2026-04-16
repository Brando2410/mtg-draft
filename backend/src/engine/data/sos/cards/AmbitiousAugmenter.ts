import { CardDefinition, AbilityType, EffectType, TriggerEvent, TargetMapping } from '@shared/engine_types';

export const AmbitiousAugmenter: CardDefinition = {
    "name": "Ambitious Augmenter",
    "manaCost": "{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Turtle",
        "Wizard"
    ],
    "keywords": ["Increment"],
    "oracleText": "Increment (Whenever you cast a spell, if the amount of mana you spent is greater than this creature's power or toughness, put a +1/+1 counter on this creature.)\nWhen this creature dies, if it had one or more counters on it, create a 0/0 green and blue Fractal creature token, then put this creature's counters on that token.",
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Death,
            condition: 'HAS_COUNTERS',
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
                    amount: 1
                },
                {
                    type: 'MoveCounters',
                    targetMapping: 'LAST_CREATED_TOKEN',
                    sourceMapping: 'SELF',
                    counterType: '+1/+1'
                }
            ]
        }
    ],
    "power": "1",
    "toughness": "1"
};



