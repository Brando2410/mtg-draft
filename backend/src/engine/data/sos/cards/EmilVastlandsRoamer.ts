import { AbilityType, CardDefinition, ConditionType, CounterType, CostType, DynamicAmount, EffectType, TargetMapping } from '@shared/engine_types';
export const EmilVastlandsRoamer: CardDefinition = {
    name: "Emil, Vastlands Roamer",
    manaCost: "{2}{G}",
    colors: ["G"],
    types: ["Legendary", "Creature"],
    subtypes: ["Elf", "Druid"],
    keywords: [],
    power: "3",
    toughness: "3",
    oracleText: "Creatures you control with +1/+1 counters on them have trample.\n{4}{G}, {T}: Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it, where X is the number of differently named lands you control.",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 6,
                    abilitiesToAdd: ['Trample'],
                    targetMapping: TargetMapping.AllCreaturesYouControl,
                    condition: ConditionType.HasCounters
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{4}{G}' },
                { type: CostType.Tap }
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
                        image_url: "https://cards.scryfall.io/normal/front/d/e/de564776-9d88-4533-8717-842eecdd0594.jpg?1775828279"
                    },
                    startingCounters: {
                        counterType: CounterType.P1P1,
                        amount: DynamicAmount.DifferentlyNamedLandsCount
                    }
                }
            ]
        }
    ],
    scryfall_id: "3654416d-8558-4af2-9e10-18dbc8f2b376",
    image_url: "https://cards.scryfall.io/normal/front/3/6/3654416d-8558-4af2-9e10-18dbc8f2b376.jpg?1775937993",
    rarity: "uncommon"
};

