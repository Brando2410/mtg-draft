import { AbilityType, CardDefinition, DynamicAmount, EffectType, Restriction, TargetMapping } from '@shared/engine_types';

export const CullingRitual: CardDefinition = {
        name: "Culling Ritual",
        manaCost: "{2}{B}{G}",

        colors: ["B", "G"],
        types: ["Sorcery"],
        oracleText: "Destroy each nonland permanent with mana value 2 or less. Add {B} or {G} for each permanent destroyed this way.",
        abilities: [{
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.AllMatchingPermanents,
                    restrictions: [Restriction.NonLand, Restriction.ManaValue2OrLess]
                },
                {
                    type: EffectType.Choice,
                    label: "Choose colors for each mana added",
                    effects: [{ type: EffectType.AddMana, manaType: 'BG', amount: DynamicAmount.DestroyedCount }]
                }
            ]
        }],
    scryfall_id: "abaad8c5-763d-4276-9b19-623cd19f59b9",
    image_url: "https://cards.scryfall.io/normal/front/a/b/abaad8c5-763d-4276-9b19-623cd19f59b9.jpg?1775941703",
    rarity: "rare"
};

