import { AbilityType, CardDefinition, ConditionType, CostType, EffectType, TargetMapping } from '@shared/engine_types';
    export const PotionersTrove: CardDefinition = {
    name: "Potioner's Trove",
    manaCost: "{3}",
    colors: [],
    types: [
        "Artifact"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "{T}: Add one mana of any color.\n{T}: You gain 2 life. Activate only if you've cast an instant or sorcery spell this turn.",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            isManaAbility: true,
            effects: [
                {
                    type: CostType.Choice,
                    label: "Select color",
                    choices: [
                        { label: "{W}", effects: [{ type: EffectType.AddMana, value: 'W' }] },
                        { label: "{U}", effects: [{ type: EffectType.AddMana, value: 'U' }] },
                        { label: "{B}", effects: [{ type: EffectType.AddMana, value: 'B' }] },
                        { label: "{R}", effects: [{ type: EffectType.AddMana, value: 'R' }] },
                        { label: "{G}", effects: [{ type: EffectType.AddMana, value: 'G' }] }
                    ]
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            condition: ConditionType.CastInstantSorceryThisTurn,
            effects: [
                {
                    type: EffectType.GainLife,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
    
