import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';
export const GrowthCurve: CardDefinition = {
    name: "Growth Curve",
    manaCost: "{G}{U}",
    scryfall_id: "1675a445-86ae-413b-b95a-a1c254a7f252",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/1/6/1675a445-86ae-413b-b95a-a1c254a7f252.jpg?1775938339",
    colors: [
        "G",
        "U"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Put a +1/+1 counter on target creature you control, then double the number of +1/+1 counters on that creature.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
                restrictions: [
                    Restriction.YouControl
                ]
            },
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: '+1/+1',
                    amount: 1,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.DoubleCounters,
                    counterType: '+1/+1',
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
