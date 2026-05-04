import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const ArcaneOmens: CardDefinition = {
    name: "Arcane Omens",
    manaCost: "{4}{B}",
    scryfall_id: "d357d997-9d4e-4ade-81f2-37629853f13a",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/d/3/d357d997-9d4e-4ade-81f2-37629853f13a.jpg?1775937419",
    colors: [
        "B"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Converge — Target player discards X cards, where X is the number of colors of mana spent to cast this spell.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{ type: TargetType.Player }],
            effects: [
                {
                    type: EffectType.DiscardCards,
                    amount: DynamicAmount.ConvergeAmount,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
    
