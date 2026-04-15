import { CardDefinition, AbilityType, EffectType, Zone } from '@shared/engine_types';

export const Forest: CardDefinition = {
    "name": "Forest",
    "manaCost": "",
    "colors": [],
    "types": [
        "Basic",
        "Land"
    ],
    "subtypes": [
        "Forest"
    ],
    "oracleText": "({T}: Add {G}.)",
    "abilities": [
        {
            id: "forest_mana",
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            isManaAbility: true,
            costs: [{ type: 'Tap', targetMapping: 'SELF' }],
            effects: [{ type: EffectType.AddMana, value: '{G}' }]
        }
    ]
};


