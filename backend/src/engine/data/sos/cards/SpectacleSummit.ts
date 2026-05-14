import { AbilityType, CardDefinition, CostType, EffectType } from '@shared/engine_types';
export const SpectacleSummit: CardDefinition = {
    name: "Spectacle Summit",
    manaCost: "",
    colors: [],
    types: ["Land"],
    subtypes: [],
    keywords: [],
    oracleText: "This land enters tapped.\n{T}: Add {U} or {R}.\n{2}{U}{R}, {T}: Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
    entersTapped: true,
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            id: "{T}: Add {U} or {R}",
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.Choice,
                    showCancel: true,
                    label: "Choose a color",
                    choices: [
                        { label: '{U}', effects: [{ type: EffectType.AddMana, manaType: 'U' }] },
                        { label: '{R}', effects: [{ type: EffectType.AddMana, manaType: 'R' }] }
                    ]
                }
            ]
        },
        {
            type: AbilityType.Activated,
            id: "{2}{U}{R}, {T}: Surveil 1",
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
    ],
    scryfall_id: "a0a66f7b-eab4-45da-8895-c2c2c7eb05f8",
    image_url: "https://cards.scryfall.io/normal/front/a/0/a0a66f7b-eab4-45da-8895-c2c2c7eb05f8.jpg?1775938830",
    rarity: "common"
};

