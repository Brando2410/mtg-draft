import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const CostofBrilliance: CardDefinition = {
    name: "Cost of Brilliance",
    manaCost: "{2}{B}",
    scryfall_id: "3a46816b-9f75-4c72-9ec6-cded6a4a0d01",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/3/a/3a46816b-9f75-4c72-9ec6-cded6a4a0d01.jpg?1775937447",
    colors: ["B"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Target player draws two cards and loses 2 life. Put a +1/+1 counter on up to one target creature.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [
                { type: TargetType.Player, count: 1 },
                { type: TargetType.Creature, count: 1, minCount: 0 }
            ],
            effects: [
                { type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Target1 },
                { type: EffectType.LoseLife, amount: 2, targetMapping: TargetMapping.Target1 },
                { 
                    type: EffectType.AddCounters, 
                    counterType: 'P1P1', 
                    amount: 1, 
                    targetMapping: TargetMapping.Target2 
                }
            ]
        }
    ]
};
