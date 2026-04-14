import { CardDefinition, AbilityType, EffectType } from '@shared/engine_types';

export const DreamrootCascade: CardDefinition = {
    "name": "Dreamroot Cascade",
    "manaCost": "",
    "colors": [],
    "types": [
        "Land"
    ],
    "subtypes": [],
    "oracleText": "This land enters tapped unless you control two or more other lands.\n{T}: Add {G} or {U}.",
    "entersTappedCondition": "OTHER_LANDS_LE:1",
    "abilities": [
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Tap' }],
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.AddMana,
                    choices: [
                        { label: '{G}', effects: [{ type: EffectType.AddMana, manaType: 'G' }] },
                        { label: '{U}', effects: [{ type: EffectType.AddMana, manaType: 'U' }] }
                    ]
                }
            ]
        }
    ]
};
