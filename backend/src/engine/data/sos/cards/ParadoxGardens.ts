import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from '@shared/engine_types';
    export const ParadoxGardens: CardDefinition = {
    name: "Paradox Gardens",
    manaCost: "",
    scryfall_id: "dbc3447e-1329-4ea1-b4ca-b321b0ffec8f",
    image_url: "https://cards.scryfall.io/normal/front/d/b/dbc3447e-1329-4ea1-b4ca-b321b0ffec8f.jpg?1775938801",
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
            costs: [{ type: CostType.Tap }],
            effects: [
                {
                    type: CostType.Choice,
                    label: "Add {G} or {U}",
                    choices: [
                        { label: "Add {G}", effects: [{ type: EffectType.AddMana, value: '{G}' }] },
                        { label: "Add {U}", effects: [{ type: EffectType.AddMana, value: '{U}' }] }
                    ]
                }
            ],
            isManaAbility: true
        },
        {
            type: AbilityType.Activated,
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
    ]
};
    
