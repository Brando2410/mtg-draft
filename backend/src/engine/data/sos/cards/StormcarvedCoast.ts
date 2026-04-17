import { TargetMapping, AbilityType, CardDefinition, CostType, EffectType, TargetType, TriggerEvent } from '@shared/engine_types';
export const StormcarvedCoast: CardDefinition = {
    name: "Stormcarved Coast",
    manaCost: "",
    colors: [],
    types: [
        "Land"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "This land enters tapped unless you control two or more other lands.\n{T}: Add {U} or {R}.",
    entersTappedCondition: "OTHER_LANDS_LE:1",
    abilities: [
        {
        type: AbilityType.Activated,
        costs: [{ type: CostType.Tap, targetMapping: TargetMapping.Self }],
        isManaAbility: true,
        effects: [
            {
                type: EffectType.Choice,
                optional: true,
                label: "Choose a color",
                choices: [
                    { label: '{U}', effects: [{ type: EffectType.AddMana, manaType: 'U' }] },
                    { label: '{R}', effects: [{ type: EffectType.AddMana, manaType: 'R' }] }
                ]
            }
        ]
    }
    ]
};


