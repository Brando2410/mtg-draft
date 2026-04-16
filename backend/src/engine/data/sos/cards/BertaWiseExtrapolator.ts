import { CardDefinition, AbilityType, EffectType, TriggerEvent, TargetMapping, ConditionType } from '@shared/engine_types';

export const BertaWiseExtrapolator: CardDefinition = {
    "name": "Berta, Wise Extrapolator",
    "manaCost": "{2}{G}{U}",
    "colors": [
        "G",
        "U"
    ],
    "types": [
        "Legendary",
        "Creature"
    ],
    "subtypes": [
        "Frog",
        "Druid"
    ],
    "keywords": ["Increment"],
    "oracleText": "Increment (Whenever you cast a spell, if the amount of mana you spent is greater than this creature's power or toughness, put a +1/+1 counter on this creature.)\nWhenever one or more +1/+1 counters are put on Berta, add one mana of any color.\n{X}, {T}: Create a 0/0 green and blue Fractal creature token and put X +1/+1 counters on it.",
    "abilities": [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CountersAdded,
            condition: 'TRIGGER_TARGET_IS_SELF && EVENT_COUNTER_TYPE_MATCHES:p1p1',
            effects: [
                {
                    type: EffectType.AddMana,
                    manaType: 'ANY',
                    amount: 1
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: 'Mana', value: '{X}' },
                { type: 'Tap', targetMapping: TargetMapping.Self }
            ],
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Fractal',
                        power: '0',
                        toughness: '0',
                        colors: ['G', 'U'],
                        types: ['Creature'],
                        subtypes: ['Fractal'],
                        image_url: 'https://cards.scryfall.io/png/front/9/1/910f48ab-b04e-4874-b31d-a86a7bc5af14.png?1682693894'
                    }

                },
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'LAST_CREATED_TOKEN',
                    amount: 'X',
                    value: 'p1p1'
                }
            ]
        }
    ],
    "power": "1",
    "toughness": "4"
};



