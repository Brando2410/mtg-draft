import { AbilityType, CardDefinition, ConditionType, CostType, DynamicAmount, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const EmilVastlandsRoamer: CardDefinition = {
    name: "Emil, Vastlands Roamer",
    manaCost: "{2}{G}",
    scryfall_id: "3654416d-8558-4af2-9e10-18dbc8f2b376",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/3/6/3654416d-8558-4af2-9e10-18dbc8f2b376.jpg?1775937993",
    colors: [
        "G"
    ],
    types: [
        "Legendary",
        "Creature"
    ],
    subtypes: [
        "Elf",
        "Druid"
    ],
    keywords: [],
    oracleText: "Creatures you control with +1/+1 counters on them have trample.\n{4}{G}, {T}: Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it, where X is the number of differently named lands you control.",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    sublayer: 'AbilityAdding',
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
                { type: CostType.Tap, targetMapping: TargetMapping.Self }
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
                    targetMapping: TargetMapping.LastCreatedToken,
                    amount: DynamicAmount.DifferentlyNamedLandsCount,
                    counterType: '+1/+1'
                }
            ]
        }
    ],
    power: "3",
    toughness: "3"
};
    
