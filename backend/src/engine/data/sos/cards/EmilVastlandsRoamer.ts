import { CardDefinition, AbilityType, EffectType, TargetMapping, DurationType, DynamicAmount } from '@shared/engine_types';

export const EmilVastlandsRoamer: CardDefinition = {
    "name": "Emil, Vastlands Roamer",
    "manaCost": "{2}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Legendary",
        "Creature"
    ],
    "subtypes": [
        "Elf",
        "Druid"
    ],
    "oracleText": "Creatures you control with +1/+1 counters on them have trample.\n{4}{G}, {T}: Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it, where X is the number of differently named lands you control.",
    "abilities": [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    sublayer: 'AbilityAdding',
                    abilitiesToAdd: ['Trample'],
                    targetMapping: TargetMapping.AllCreaturesYouControl,
                    condition: 'HAS_COUNTERS'
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: 'Mana', value: '{4}{G}' },
                { type: 'Tap', targetMapping: TargetMapping.Self }
            ],
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Fractal',
                        colors: ['G', 'U'],
                        types: ['Creature'],
                        subtypes: ['Fractal'],
                        power: 0,
                        toughness: 0,
                        image_url: 'https://cards.scryfall.io/png/front/9/1/910f48ab-b04e-4874-b31d-a86a7bc5af14.png?1682693894'
                    }
                },
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'LAST_CREATED_TOKEN',
                    amount: DynamicAmount.DifferentlyNamedLandsCount,
                    value: 'p1p1'
                }
            ]
        }
    ],
    "power": "3",
    "toughness": "3"
};


