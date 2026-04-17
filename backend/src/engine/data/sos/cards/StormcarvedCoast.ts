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
    abilities: [{
        type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
        effects: [
            {
                type: CostType.Tap,
                condition: 'LAND_COUNT_GE:2', 
                targetMapping: TargetMapping.Self
            }
        ]
    },
    {
        type: AbilityType.Activated,
        costs: [{ type: CostType.Tap, targetMapping: TargetMapping.Self }],
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
    

