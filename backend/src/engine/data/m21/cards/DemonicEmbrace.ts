import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const DemonicEmbrace: CardDefinition = {
    name: "Demonic Embrace",
    manaCost: "{1}{B}{B}",
    oracleText: "Enchant creature\nEnchanted creature gets +3/+1, has flying, and is a Demon in addition to its other types.\nYou may cast this card from your graveyard by paying 3 life and discarding a card in addition to paying its other costs.",
    colors: ["B"],
    types: ["Enchantment"],
    subtypes: ["Aura"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.Creature, count: 1 }
        },
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 4,
                    subtypesToAdd: ['Demon'],
                    targetMapping: TargetMapping.EnchantedCreature
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 6,
                    abilitiesToAdd: ['Flying'],
                    targetMapping: TargetMapping.EnchantedCreature
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 7,
                    powerModifier: 3,
                    toughnessModifier: 1,
                    targetMapping: TargetMapping.EnchantedCreature
                }
            ]
        },
        {
            type: AbilityType.Static,
            activeZone: Zone.Graveyard,
            effects: [{
                type: EffectType.AllowCastFromGraveyard,
                additionalCosts: [
                    { type: CostType.PayLife, value: 3 },
                    { type: CostType.Discard, amount: 1 }
                ],
                targetMapping: TargetMapping.Self
            }]
        }
    ]
};


