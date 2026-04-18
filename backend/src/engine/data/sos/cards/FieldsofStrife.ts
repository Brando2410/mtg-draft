import { AbilityType, CardDefinition, CostType, EffectType } from '@shared/engine_types';
export const FieldsofStrife: CardDefinition = {
    name: "Fields of Strife",
    manaCost: "",
    scryfall_id: "3dc7a4c3-c356-4fba-bea0-e8788da3eb57",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/3/d/3dc7a4c3-c356-4fba-bea0-e8788da3eb57.jpg?1775938780",
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
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.Choice,
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
