import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
    export const ColossusoftheBloodAge: CardDefinition = {
    name: "Colossus of the Blood Age",
    manaCost: "{4}{R}{W}",
    scryfall_id: "bfa7f0a4-6b65-4e53-ba00-848df260d8e3",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/b/f/bfa7f0a4-6b65-4e53-ba00-848df260d8e3.jpg?1775938248",
    colors: [
        "R",
        "W"
    ],
    types: [
        "Artifact",
        "Creature"
    ],
    subtypes: [
        "Construct"
    ],
    keywords: [],
    oracleText: "When this creature enters, it deals 3 damage to each opponent and you gain 3 life.\nWhen this creature dies, discard any number of cards, then draw that many cards plus one.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                { type: EffectType.DealDamage, amount: 3, targetMapping: TargetMapping.EachOpponent },
                { type: EffectType.GainLife, amount: 3, targetMapping: TargetMapping.Controller }
            ]
        },
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Death,
            effects: [
                {
                    type: EffectType.DiscardCards,
                    amount: TargetType.Any,
                    targetMapping: TargetMapping.Controller,
                    next: {
                        type: EffectType.DrawCards,
                        amount: DynamicAmount.DiscardedCountPlus1,
                        targetMapping: TargetMapping.Controller
                    }
                }
            ]
        }
    ],
    power: "6",
    toughness: "6"
};
    
