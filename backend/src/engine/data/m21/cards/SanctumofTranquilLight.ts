import { AbilityType, CardDefinition, CostType, DynamicAmount, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const SanctumofTranquilLight: CardDefinition = {
    name: "Sanctum of Tranquil Light",
    manaCost: "{W}",
    oracleText: "{5}{W}: Tap target creature. This ability costs {1} less to activate for each Shrine you control.",
    colors: ["W"],
    supertypes: ["Legendary"],
    types: ["Enchantment"],
    subtypes: ["Shrine"],
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{5}{W}' }],
            costReduction: {
                type: 'ManaReduction',
                amount: DynamicAmount.ShrinesYouControlCount,
                manaType: 'Generic'
            },
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
            },
            effects: [{ type: EffectType.Tap, targetMapping: TargetMapping.Target1 }]
        }
    ]
};
