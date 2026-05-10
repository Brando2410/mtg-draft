import { AbilityType, CardDefinition, ConditionType, EffectType, Restriction, TargetMapping } from '@shared/engine_types';

export const ZaffaiandtheTempests: CardDefinition = {
    name: "Zaffai and the Tempests",
    manaCost: "{5}{U}{R}",
 // placeholder,
    colors: ["U", "R"],
    types: ["Legendary", "Creature"],
    subtypes: ["Human", "Bard", "Sorcerer"],
    keywords: [],
    oracleText: "Once during each of your turns, you may cast an instant or sorcery spell from your hand without paying its mana cost.",
    abilities: [
        {
            type: AbilityType.Static,
            condition: ConditionType.IsYourTurn,
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
    toughness: "7",
    scryfall_id: "5bdbf507-6fd7-49f6-b437-8f2ce2d0eb0f",
    image_url: "https://cards.scryfall.io/normal/front/5/b/5bdbf507-6fd7-49f6-b437-8f2ce2d0eb0f.jpg?1775938717",
    rarity: "rare"
};

