import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from '@shared/engine_types';

export const ParadoxGardens: CardDefinition = {
    name: "Paradox Gardens",
    manaCost: "",


    colors: [],
    types: [
        "Land"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "This land enters tapped.\n{T}: Add {G} or {U}.\n{2}{G}{U}, {T}: Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
    entersTapped: true,
    abilities: [
        {
            type: AbilityType.Activated,
            id: "{T}: Add {G} or {U}",
            costs: [{ type: CostType.Tap }],
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Add {G} or {U}",
                    choices: [
                        { label: "Add {G}", effects: [{ type: EffectType.AddMana, manaType: 'G' }] },
                        { label: "Add {U}", effects: [{ type: EffectType.AddMana, manaType: 'U' }] }
                    ]
                }
            ],
            isManaAbility: true
        },
        {
            type: AbilityType.Activated,
            id: "{2}{G}{U}, {T}: Surveil 1",
            costs: [
                { type: CostType.Mana, value: '{2}{G}{U}' },
                { type: CostType.Tap }
            ],
            effects: [
                {
                    type: EffectType.Surveil,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "dbc3447e-1329-4ea1-b4ca-b321b0ffec8f",
    image_url: "https://cards.scryfall.io/normal/front/d/b/dbc3447e-1329-4ea1-b4ca-b321b0ffec8f.jpg?1775938801",
    rarity: "common"
};

