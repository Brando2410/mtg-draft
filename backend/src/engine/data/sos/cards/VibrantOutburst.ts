import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const VibrantOutburst: CardDefinition = {
    name: "Vibrant Outburst",
    manaCost: "{U}{R}",
    colors: [
        "R",
        "U"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Vibrant Outburst deals 3 damage to any target. Tap up to one target creature.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [
                {
                    type: TargetType.AnyTarget,
                    count: 1,
                    label: 'Deal 3 damage to'
                },
                {
                    type: TargetType.Creature,
                    count: 1,
                    minCount: 0,
                    label: 'Tap target creature (optional)'
                }
            ],
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 3,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: CostType.Tap,
                    targetMapping: TargetMapping.Target2
                }
            ]
        }
    ],
    scryfall_id: "f9ba68ef-6efc-4249-8b74-e33f47173902",
    image_url: "https://cards.scryfall.io/normal/front/f/9/f9ba68ef-6efc-4249-8b74-e33f47173902.jpg?1775938674",
    rarity: "uncommon"
};

