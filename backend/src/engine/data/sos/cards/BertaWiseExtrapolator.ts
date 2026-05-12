import { AbilityType, CardDefinition, ConditionType, CostType, DynamicAmount, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const BertaWiseExtrapolator: CardDefinition = {
    name: "Berta, Wise Extrapolator",
    manaCost: "{2}{G}{U}",
    colors: ["G", "U"],
    types: ["Legendary", "Creature"],
    subtypes: ["Frog", "Druid"],
    keywords: ["Increment"],
    power: "1",
    toughness: "4",
    oracleText: "Increment (Whenever you cast a spell, if the amount of mana you spent is greater than this creature's power or toughness, put a +1/+1 counter on this creature.)\nWhenever one or more +1/+1 counters are put on Berta, add one mana of any color.\n{X}, {T}: Create a 0/0 green and blue Fractal creature token and put X +1/+1 counters on it.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CountersAdded,
            condition: `${ConditionType.TriggerTargetIsSelf} && ${ConditionType.EventCounterTypeMatches}:+1/+1`,
            effects: [
                {
                    type: EffectType.AddMana,
                    manaType: 'Any',
                    amount: 1
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{X}' },
                { type: CostType.Tap }
            ],
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Fractal',
                        power: 0,
                        toughness: 0,
                        colors: ['G', 'U'],
                        types: ['Creature'],
                        subtypes: ['Fractal'],
                        image_url: "https://cards.scryfall.io/normal/front/d/e/de564776-9d88-4533-8717-842eecdd0594.jpg?1775828279"
                    }
                },
                {
                    type: EffectType.AddCounters,
                    targetMapping: TargetMapping.LastCreatedToken,
                    amount: DynamicAmount.X,
                    counterType: '+1/+1'
                }
            ]
        }
    ],
    scryfall_id: "75f89c36-c81d-4580-9a5c-218fed0c5c9a",
    image_url: "https://cards.scryfall.io/normal/front/7/5/75f89c36-c81d-4580-9a5c-218fed0c5c9a.jpg?1775938201",
    rarity: "rare"
};

