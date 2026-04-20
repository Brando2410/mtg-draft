import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const MaleficScythe: CardDefinition = {
    name: 'Malefic Scythe',
    manaCost: '{B}',
    scryfall_id: "89e2bc57-8f18-4ba1-a11b-9d69d029f56a",
    image_url: "https://cards.scryfall.io/normal/front/8/9/89e2bc57-8f18-4ba1-a11b-9d69d029f56a.jpg?1594736272",
    colors: ['B'],
    types: ['Artifact'],
    subtypes: ['Equipment'],
    oracleText: 'Equipped creature gets +1/+1 for each soul counter on Malefic Scythe.\nWhenever equipped creature dies, put a soul counter on Malefic Scythe.\nEquip {1}',
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                layer: 7,
                powerModifier: 'SOURCE_COUNTERS:soul',
                toughnessModifier: 'SOURCE_COUNTERS:soul',
                targetMapping: TargetMapping.EnchantedCreature
            }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Death,
            condition: 'IS_ENCHANTED_CREATURE',
            effects: [{
                type: EffectType.AddCounters,
                amount: 1,
                counterType: 'soul',
                targetMapping: TargetMapping.Self
            }]
        },
        {
            type: AbilityType.Activated,
            activatedOnlyAsSorcery: true,
            costs: [{ type: CostType.Mana, value: '{1}' }],
            targetDefinition: {
                type: TargetType.Creature,
                restrictions: [Restriction.YouControl]
            },
            effects: [{
                type: EffectType.Attach,
                targetMapping: TargetMapping.Target1
            }]
        }
    ]
};
