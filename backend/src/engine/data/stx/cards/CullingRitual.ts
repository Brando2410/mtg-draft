import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

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
                    restrictions: [{ type: 'Nonland' }, { type: 'Attribute', attribute: 'ManaValue', value: 2, comparison: 'LE' }]
                },
                {
                    type: EffectType.Choice,
                    label: "Choose colors for each mana added",
                    effects: [{ type: EffectType.AddMana, manaType: 'BG', amount: DynamicAmount.DestroyedCount }]
                }
            ]
        }]
    };

