import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from '@shared/engine_types';
    export const HydroChanneler: CardDefinition = {
    name: "Hydro-Channeler",
    manaCost: "{1}{U}",
    colors: [
        "U"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Merfolk",
        "Wizard"
    ],
    keywords: [],
    oracleText: "{T}: Add {U}. Spend this mana only to cast an instant or sorcery spell.\n{1}, {T}: Add one mana of any color. Spend this mana only to cast an instant or sorcery spell.",
    power: "1",
    toughness: "3",

    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            effects: [
                {
                    type: EffectType.AddMana,
                    value: '{U}',
                    manaRestrictions: ['InstantOrSorcery'],
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{1}' }, { type: CostType.Tap }],
            effects: [
                {
                    type: 'Choice' as any,
                    label: "Choose a color of mana to add",
                    effects: [
                        { type: EffectType.AddMana, value: '{W}', manaRestrictions: ['InstantOrSorcery'], label: "Add {W}", targetMapping: TargetMapping.Controller },
                        { type: EffectType.AddMana, value: '{U}', manaRestrictions: ['InstantOrSorcery'], label: "Add {U}", targetMapping: TargetMapping.Controller },
                        { type: EffectType.AddMana, value: '{B}', manaRestrictions: ['InstantOrSorcery'], label: "Add {B}", targetMapping: TargetMapping.Controller },
                        { type: EffectType.AddMana, value: '{R}', manaRestrictions: ['InstantOrSorcery'], label: "Add {R}", targetMapping: TargetMapping.Controller },
                        { type: EffectType.AddMana, value: '{G}', manaRestrictions: ['InstantOrSorcery'], label: "Add {G}", targetMapping: TargetMapping.Controller }
                    ],
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
};
    
