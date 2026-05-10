import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping } from '@shared/engine_types';
export const ResonatingLute: CardDefinition = {
    name: "Resonating Lute",
    manaCost: "{2}{U}{R}",
    colors: [
        "R",
        "U"
    ],
    types: [
        "Artifact"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Lands you control have \"{T}: Add two mana of any one color. Spend this mana only to cast instant and sorcery spells.\"\n{T}: Draw a card. Activate only if you have seven or more cards in your hand.",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.AllLandsYouControl,
                    abilitiesToAdd: [
                        {
                            type: AbilityType.Activated,
                            isManaAbility: true,
                            id: "{T}: Add two mana of any one color. Spend this mana only to cast instant and sorcery spells.",
                            costs: [{ type: CostType.Tap }],
                            effects: [
                                {
                                    type: EffectType.AddMana,
                                    manaType: 'ANY',
                                    amount: 2,
                                    manaRestrictions: [Restriction.InstantOrSorcery]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            type: AbilityType.Activated,
            id: "{T}: Draw a card. Activate only if you have seven or more cards in your hand.",
            costs: [{ type: CostType.Tap }],
            condition: 'HAND_COUNT_GE:7',
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "6ef168d6-28f2-4c24-9bfa-82c35663b729",
    image_url: "https://cards.scryfall.io/normal/front/6/e/6ef168d6-28f2-4c24-9bfa-82c35663b729.jpg?1775938538",
    rarity: "rare"
};

