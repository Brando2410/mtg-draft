import { AbilityType, CardDefinition, CostType, TargetType } from '@shared/engine_types';
export const EndoftheHunt: CardDefinition = {
    name: "End of the Hunt",
    manaCost: "{1}{B}",
    scryfall_id: "0809b51a-6a05-4f18-9bf4-1b8382da648f",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/0/8/0809b51a-6a05-4f18-9bf4-1b8382da648f.jpg?1775937476",
    colors: [
        "B"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Target opponent exiles a creature or planeswalker they control with the highest mana value among creatures and planeswalkers they control.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Opponent,
                count: 1,
            }],
            effects: [
                {
                    type: CostType.Exile,
                    targetMapping: 'TARGET_1_HIGHEST_MV_CREATURE_PLANESWALKER'
                }
            ]
        }
    ]
};
