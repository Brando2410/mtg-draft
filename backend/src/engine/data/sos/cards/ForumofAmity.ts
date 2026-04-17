import { AbilityType, CardDefinition, CostType, EffectType } from '@shared/engine_types';
    export const ForumofAmity: CardDefinition = {
    name: "Forum of Amity",
    manaCost: "",
    colors: [],
    types: [
        "Land"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "This land enters tapped.\n{T}: Add {W} or {B}.\n{2}{W}{B}, {T}: Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
    entersTapped: true,
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            effects: [
                {
                    type: EffectType.AddMana,
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
    
