import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const ParadoxGardens: CardDefinition = {
    "name": "Paradox Gardens",
    "manaCost": "",
    "colors": [],
    "types": [
        "Land"
    ],
    "subtypes": [],
    "oracleText": "This land enters tapped.\n{T}: Add {G} or {U}.\n{2}{G}{U}, {T}: Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
    "entersTapped": true,
    "abilities": [
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Tap' }],
            effects: [
                {
                    type: EffectType.Choice,
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
                { type: 'Mana', value: '{2}{G}{U}' },
                { type: 'Tap' }
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


