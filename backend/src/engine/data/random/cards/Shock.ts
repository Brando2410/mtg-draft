import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const Shock: CardDefinition = {
    name: 'Shock',
    manaCost: '{R}',
    colors: ['R'],
    types: ['Instant'],
    oracleText: 'Shock deals 2 damage to any target.',
    abilities: [
      {
        type: AbilityType.Spell,
        targetDefinitions: [{
            count: 1,
            type: TargetType.AnyTarget
        }],
        effects: [{ type: EffectType.DealDamage, amount: 2, targetMapping: TargetMapping.Target1 }]
      }
    ],
    scryfall_id: "760b41a1-c087-4b11-b8a0-fb01d8a4c0c6",
    image_url: "https://cards.scryfall.io/normal/front/7/6/760b41a1-c087-4b11-b8a0-fb01d8a4c0c6.jpg?1757377337",
    rarity: "common"
};

