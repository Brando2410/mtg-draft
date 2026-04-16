import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';

export const TitansGrave: CardDefinition = {
    "name": "Titan's Grave",
    "manaCost": "",
    "colors": [],
    "types": [
        "Land"
    ],
    "subtypes": [],
    "oracleText": "This land enters tapped.\n{T}: Add {B} or {G}.\n{2}{B}{G}, {T}: Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
    "entersTapped": true,
    "abilities": [
        {
            type: AbilityType.Activated,
            id: "Add {B} or {G}",
            costs: [{ type: 'Tap' }],
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.AddMana,
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
            costs: [
                { type: 'Mana', value: '{2}{B}{G}' },
                { type: 'Tap' }
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



