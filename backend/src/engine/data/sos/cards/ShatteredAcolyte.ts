import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const ShatteredAcolyte: CardDefinition = {
    name: "Shattered Acolyte",
    manaCost: "{1}{W}",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Dwarf", "Warlock"],
    keywords: ["Lifelink"],
    power: "2",
    toughness: "2",
    oracleText: "Lifelink\n{1}, Sacrifice this creature: Destroy target artifact or enchantment.",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{1}' },
                { type: CostType.SacrificeSelf }
            ],
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.Target1
                }
            ],
            targetDefinitions: [{
                count: 1,
                type: TargetType.ArtifactOrEnchantment
            }]
        }
    ],
    scryfall_id: "dc0517ca-b271-49a1-a286-c20f4e5b9309",
    image_url: "https://cards.scryfall.io/normal/front/d/c/dc0517ca-b271-49a1-a286-c20f4e5b9309.jpg?1775937130",
    rarity: "common"
};

