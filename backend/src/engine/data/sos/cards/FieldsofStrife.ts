import { AbilityType, CardDefinition, CostType, EffectType } from '@shared/engine_types';
    export const FieldsofStrife: CardDefinition = {
    name: "Fields of Strife",
    manaCost: "",
    colors: [
        "R",
        "W"
    ],
    types: [
        "Land"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Fields of Strife enters the battlefield tapped.\n{T}: Add {R} or {W}.\n{2}{R}{W}, {T}: Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
    entersTapped: true,
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            effects: [
                {
                    type: CostType.Choice,
                    label: "Choose a color",
                    choices: [
                        { label: "{R}", effects: [{ type: EffectType.AddMana, value: 'R' }] },
                        { label: "{W}", effects: [{ type: EffectType.AddMana, value: 'W' }] }
                    ]
                }
            ]
        },
        {
            type: AbilityType.Activated,
            manaCost: "{2}{R}{W}",
            costs: [{ type: CostType.TapSelection }],
            effects: [
                { type: EffectType.Surveil, amount: 1 }
            ]
        }
    ]
};
    