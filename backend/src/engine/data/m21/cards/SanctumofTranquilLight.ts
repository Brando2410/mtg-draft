import { AbilityType, CardDefinition, CostType, DynamicAmount, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const SanctumofTranquilLight: CardDefinition = {
    name: "Sanctum of Tranquil Light",
    manaCost: "{W}",
    scryfall_id: "34a5d346-6102-40fd-b39b-c4371929bd44",
    image_url: "https://cards.scryfall.io/normal/front/3/4/34a5d346-6102-40fd-b39b-c4371929bd44.jpg?1594735160",
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
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1,
            }],
            effects: [{ type: EffectType.Tap, targetMapping: TargetMapping.Target1 }]
        }
    ]
};
