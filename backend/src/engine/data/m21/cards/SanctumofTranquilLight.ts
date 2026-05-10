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
                type: EffectType.CostReduction,
                reductionAmount: DynamicAmount.ShrinesYouControlCount
            },
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1
            }],
            effects: [{ type: EffectType.Tap, targetMapping: TargetMapping.Target1 }]
        }
    ],
    scryfall_id: "34a5478a-1a2c-4117-b543-da083ed2b562",
    image_url: "https://cards.scryfall.io/normal/front/3/4/34a5478a-1a2c-4117-b543-da083ed2b562.jpg?1594735175",
    rarity: "uncommon"
};

