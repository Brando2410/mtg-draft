import { AbilityType, CardDefinition, CostType, EffectType } from '@shared/engine_types';

export const ForumofAmity: CardDefinition = {
    name: "Forum of Amity",
    manaCost: "",
    scryfall_id: "1de6c6cc-0c55-4997-8623-d7f796bd9ab8",
    image_url: "https://cards.scryfall.io/normal/front/1/d/1de6c6cc-0c55-4997-8623-d7f796bd9ab8.jpg?1775938787",
    colors: [],
    types: ["Land"],
    subtypes: [],
    keywords: [],
    oracleText: "This land enters tapped.\n{T}: Add {W} or {B}.\n{2}{W}{B}, {T}: Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
    entersTapped: true,
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.Choice,
                    optional: true,
                    label: "Choose a color",
                    choices: [
                        { label: '{W}', effects: [{ type: EffectType.AddMana, manaType: 'W' }] },
                        { label: '{B}', effects: [{ type: EffectType.AddMana, manaType: 'B' }] }
                    ]
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{2}{W}{B}' },
                { type: CostType.Tap }
            ],
            effects: [
                {
                    type: EffectType.Surveil,
                    amount: 1
                }
            ]
        }
    ]
};
