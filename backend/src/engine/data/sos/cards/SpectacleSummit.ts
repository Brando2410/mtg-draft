import { AbilityType, CardDefinition, CostType, EffectType } from '@shared/engine_types';
    export const SpectacleSummit: CardDefinition = {
    name: "Spectacle Summit",
    manaCost: "",
    colors: [],
    types: [
        "Land"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "This land enters tapped.\n{T}: Add {U} or {R}.\n{2}{U}{R}, {T}: Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
    entersTapped: true,
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.AddMana,
                    choices: [
                        { label: '{U}', effects: [{ type: EffectType.AddMana, manaType: 'U' }] },
                        { label: '{R}', effects: [{ type: EffectType.AddMana, manaType: 'R' }] }
                    ]
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{2}{U}{R}' },
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
    
