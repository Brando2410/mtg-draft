import { AbilityType, CardDefinition, DurationType, DynamicAmount, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const ArchaicsAgony: CardDefinition = {
    name: "Archaic's Agony",
    manaCost: "{4}{R}",
    scryfall_id: "8d99f8b2-5c1c-4059-bf68-c6b2e9e5b275",
    image_url: "https://cards.scryfall.io/normal/front/8/d/8d99f8b2-5c1c-4059-bf68-c6b2e9e5b275.jpg?1775937675",
    colors: [
        "R"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Converge — Archaic's Agony deals X damage to target creature, where X is the number of colors of mana spent to cast this spell. Exile cards from the top of your library equal to the excess damage dealt to that creature this way. You may play those cards until the end of your next turn.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.Creature },
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: DynamicAmount.ConvergeAmount,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ExileTopCardsExcessDamage,
                    targetMapping: TargetMapping.Target1,
                    duration: { type: DurationType.UntilEndOfYourNextTurn }
                }
            ]
        }
    ]
};
    
