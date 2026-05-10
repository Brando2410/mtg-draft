import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const IgneousInspiration: CardDefinition = {
    name: 'Igneous Inspiration',
    manaCost: '{2}{R}',

    colors: ['R'],
    types: ['Sorcery'],
    oracleText: "Igneous Inspiration deals 3 damage to any target. Learn.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.AnyTarget,
                count: 1
            }],
            effects: [
                { type: EffectType.DealDamage, amount: 3, targetMapping: TargetMapping.Target1 },
                { type: EffectType.Learn }
            ]
        }
    ],
    scryfall_id: "5781ad7b-dc1b-4cc1-9e72-6e714b9ba1de",
    image_url: "https://cards.scryfall.io/normal/front/5/7/5781ad7b-dc1b-4cc1-9e72-6e714b9ba1de.jpg?1624591976",
    rarity: "uncommon"
};

