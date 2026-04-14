import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const HydroChanneler: CardDefinition = {
    "name": "Hydro-Channeler",
    "manaCost": "{1}{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Merfolk",
        "Wizard"
    ],
    "oracleText": "{T}: Add {U}. Spend this mana only to cast an instant or sorcery spell.\n{1}, {T}: Add one mana of any color. Spend this mana only to cast an instant or sorcery spell.",
    "abilities": [
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Tap' }],
            effects: [
                {
                    type: EffectType.AddMana,
                    value: 'U',
                    manaRestrictions: ['Instant', 'Sorcery'],
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Mana', value: '{1}' }, { type: 'Tap' }],
            effects: [
                {
                    type: 'Choice' as any,
                    label: "Choose a color of mana to add",
                    effects: [
                        { type: EffectType.AddMana, value: 'W', manaRestrictions: ['Instant', 'Sorcery'], label: "Add {W}", targetMapping: TargetMapping.Controller },
                        { type: EffectType.AddMana, value: 'U', manaRestrictions: ['Instant', 'Sorcery'], label: "Add {U}", targetMapping: TargetMapping.Controller },
                        { type: EffectType.AddMana, value: 'B', manaRestrictions: ['Instant', 'Sorcery'], label: "Add {B}", targetMapping: TargetMapping.Controller },
                        { type: EffectType.AddMana, value: 'R', manaRestrictions: ['Instant', 'Sorcery'], label: "Add {R}", targetMapping: TargetMapping.Controller },
                        { type: EffectType.AddMana, value: 'G', manaRestrictions: ['Instant', 'Sorcery'], label: "Add {G}", targetMapping: TargetMapping.Controller }
                    ],
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    "power": "1",
    "toughness": "3"
};
