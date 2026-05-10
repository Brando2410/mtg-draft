import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const TraumaticCritique: CardDefinition = {
    name: "Traumatic Critique",
    manaCost: "{X}{U}{R}",
    colors: [
        "R",
        "U"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Traumatic Critique deals X damage to any target. Draw two cards, then discard a card.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.AnyTarget,
                count: 1
            }],
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: DynamicAmount.X,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.DrawCards,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.DiscardCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "2a812fa7-4599-4e25-97db-20ffc6bc0b26",
    image_url: "https://cards.scryfall.io/normal/front/2/a/2a812fa7-4599-4e25-97db-20ffc6bc0b26.jpg?1775938668",
    rarity: "rare"
};

