import { AbilityType, CardDefinition, CostType, EffectType } from '@shared/engine_types';
export const TitansGrave: CardDefinition = {
    name: "Titan's Grave",
    manaCost: "",
    colors: [],
    types: ["Land"],

    subtypes: [],
    keywords: [],
    oracleText: "Titan's Grave enters the battlefield tapped.\n{T}: Add {B} or {G}.\n{2}{B}{G}, {T}: Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
    entersTapped: true,
    abilities: [
        {
            type: AbilityType.Activated,
            id: "Add {B} or {G}",
            costs: [{ type: CostType.Tap }],
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Choose a color",
                    choices: [
                        { label: '{B}', effects: [{ type: EffectType.AddMana, manaType: 'B' }] },
                        { label: '{G}', effects: [{ type: EffectType.AddMana, manaType: 'G' }] }
                    ]
                }
            ]
        },
        {
            type: AbilityType.Activated,
            id: "Surveil 1",
            manaCost: "{2}{B}{G}",
            costs: [
                { type: CostType.Tap }, { type: CostType.Mana, value: "{2}{B}{G}" }
            ],
            effects: [
                {
                    type: EffectType.Surveil,
                    amount: 1
                }
            ]
        }
    ],
    scryfall_id: "a9ab41c8-3ee2-4676-9b8b-20c34d9f5f21",
    image_url: "https://cards.scryfall.io/normal/front/a/9/a9ab41c8-3ee2-4676-9b8b-20c34d9f5f21.jpg?1775938861",
    rarity: "common"
};

