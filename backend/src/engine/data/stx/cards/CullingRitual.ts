import { AbilityType, CardDefinition, DynamicAmount, EffectType, Restriction, TargetMapping } from '@shared/engine_types';

export const CullingRitual: CardDefinition = {
        name: "Culling Ritual",
        manaCost: "{2}{B}{G}",
    scryfall_id: "8f6f91d3-cc07-4a42-99a0-5fb83b29cc25",
    image_url: "https://cards.scryfall.io/normal/front/8/f/8f6f91d3-cc07-4a42-99a0-5fb83b29cc25.jpg?1627428386",
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
        }]
    };
