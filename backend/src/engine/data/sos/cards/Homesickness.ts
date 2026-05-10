import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const Homesickness: CardDefinition = {
    name: "Homesickness",
    manaCost: "{4}{U}{U}",


    colors: [
        "U"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Target player draws two cards. Tap up to two target creatures. Put a stun counter on each of them. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [
                {
                    type: TargetType.Player,
                    count: 1,
                    label: "Target player to draw cards"
                },
                {
                    type: TargetType.Creature,
                    count: 2,
                    minCount: 0,
                    label: "Up to two target creatures to stun"
                }
            ],
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 2,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: CostType.Tap,
                    targetMapping: TargetMapping.Target2
                },
                {
                    type: EffectType.AddCounters,
                    counterType: 'stun',
                    amount: 1,
                    targetMapping: TargetMapping.Target2
                }
            ]
        }
    ],
    scryfall_id: "6e4a1f82-b0b1-4608-91f8-130bee731435",
    image_url: "https://cards.scryfall.io/normal/front/6/e/6e4a1f82-b0b1-4608-91f8-130bee731435.jpg?1775937280",
    rarity: "uncommon"
};

