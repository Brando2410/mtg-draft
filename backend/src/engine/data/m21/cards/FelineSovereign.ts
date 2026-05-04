import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const FelineSovereign: CardDefinition = {
    name: "Feline Sovereign",
    manaCost: "{2}{G}",
    scryfall_id: "84a9485a-d356-4cbe-b257-b62008a21328",
    image_url: "https://cards.scryfall.io/normal/front/8/4/84a9485a-d356-4cbe-b257-b62008a21328.jpg?1594736953",
    oracleText: "Other Cats you control get +1/+1 and have protection from Dogs.\nWhenever one or more Cats you control deal combat damage to a player, destroy up to one target artifact or enchantment that player controls.",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Cat"],
    power: "2",
    toughness: "3",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    toughnessModifier: 1,
                    restrictions: [Restriction.Other, Restriction.Cat, Restriction.YouControl],
                    targetMapping: TargetMapping.AllMatchingPermanents
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CombatDamagePlayer,
            condition: 'SOURCE_IS_CAT_YOU_CONTROL',
            targetDefinitions: [{
                type: TargetType.ArtifactOrEnchantment,
                count: 1,
                minCount: 0,
            }],
            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
        }
    ]
};
