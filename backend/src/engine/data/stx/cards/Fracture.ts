import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const Fracture: CardDefinition = {
    name: 'Fracture',
    manaCost: '{W}{B}',
    scryfall_id: "a11224f8-06ea-4ec3-85e6-d5c8d906840c",
    image_url: "https://cards.scryfall.io/normal/front/a/1/a11224f8-06ea-4ec3-85e6-d5c8d906840c.jpg?1627429052",
    colors: ['W', 'B'],
    types: ['Instant'],
    oracleText: "Destroy target artifact, enchantment, or planeswalker.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.ArtifactEnchantmentOrPlaneswalker,
                count: 1
            }],
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};

