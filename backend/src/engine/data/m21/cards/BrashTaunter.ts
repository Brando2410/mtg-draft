import { AbilityType, CardDefinition, CostType, ConditionType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const BrashTaunter: CardDefinition = {
    name: "Brash Taunter",
    manaCost: "{4}{R}",
    scryfall_id: "ebb5e613-a803-42f3-840a-7089ac6b7e3d",
    image_url: "https://cards.scryfall.io/normal/front/e/b/ebb5e613-a803-42f3-840a-7089ac6b7e3d.jpg?1594736510",
    oracleText: "Indestructible\nWhenever this creature is dealt damage, it deals that much damage to target opponent.\n{2}{R}, {T}: This creature fights another target creature.",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Goblin"],
    power: "1",
    toughness: "1",
    keywords: ["Indestructible"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Damaged,
            condition: ConditionType.EventObjectIsTriggerSource,
            targetDefinition: { type: TargetType.Opponent, count: 1 },
            effects: [{ type: EffectType.DealDamage, amount: 'EVENT_DAMAGE_AMOUNT', targetMapping: TargetMapping.Target1 }]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{2}{R}' },
                { type: CostType.Tap }
            ],
            targetDefinition: { type: TargetType.Creature, count: 1, restrictions: [Restriction.Other] },
            effects: [{ type: EffectType.Fight, targetMapping: TargetMapping.Self, secondTarget: TargetMapping.Target1 }]
        }
    ]
};
