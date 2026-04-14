import { CardDefinition, AbilityType, EffectType } from '@shared/engine_types';

export const StormcarvedCoast: CardDefinition = {
    "name": "Stormcarved Coast",
    "manaCost": "",
    "colors": [],
    "types": [
        "Land"
    ],
    "subtypes": [],
    "oracleText": "This land enters tapped unless you control two or more other lands.\n{T}: Add {U} or {R}.",
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
                        { label: '{U}', effects: [{ type: EffectType.AddMana, manaType: 'U' }] },
                        { label: '{R}', effects: [{ type: EffectType.AddMana, manaType: 'R' }] }
                    ]
                }
            ]
        }
    ]
};
