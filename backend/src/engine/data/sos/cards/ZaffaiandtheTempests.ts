import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping } from '@shared/engine_types';

export const ZaffaiandtheTempests: CardDefinition = {
    name: "Zaffai and the Tempests",
    manaCost: "{5}{U}{R}",
    scryfall_id: "71f760e9-b541-477a-b911-45186b520ae1", // placeholder
    colors: [
        "U",
        "R"
    ],
    types: [
        "Legendary",
        "Creature"
    ],
    subtypes: [
        "Human",
        "Bard",
        "Sorcerer"
    ],
    keywords: [],
    oracleText: "Once during each of your turns, you may cast an instant or sorcery spell from your hand without paying its mana cost.",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    isFreeCast: true,
                    targetMapping: TargetMapping.Controller,
                    restrictions: [
                        Restriction.InstantOrSorcery,
                        Restriction.FromHand
                    ],
                    limitPerTurn: 1
                }
            ]
        }
    ],
    power: "5",
    toughness: "7"
};
