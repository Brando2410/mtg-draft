import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const ImpracticalJoke: CardDefinition = {
    name: "Impractical Joke",
    manaCost: "{R}",
    scryfall_id: "39a816b4-39b8-421c-b828-68db901d34b7",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/3/9/39a816b4-39b8-421c-b828-68db901d34b7.jpg?1775937777",
    colors: ["R"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Damage can't be prevented this turn. Impractical Joke deals 3 damage to up to one target creature or planeswalker.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.CreatureOrPlaneswalker,
                count: 1,
                minCount: 0,
            }],
            effects: [
                {
                    type: EffectType.DisableDamagePrevention
                },
                {
                    type: EffectType.DealDamage,
                    amount: 3,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
