import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';
    export const BrushOff: CardDefinition = {
    name: "Brush Off",
    manaCost: "{2}{U}{U}",
    colors: [
        "U"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "This spell costs {1}{U} less to cast if it targets an instant or sorcery spell.\nCounter target spell.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: AbilityType.Spell, count: 1 },
            costReduction: {
                type: EffectType.CostReduction,
                manaReduction: '{1}{U}',
                condition: 'TARGET_IS_INSTANT_OR_SORCERY'
            },
            effects: [
                { type: EffectType.CounterSpell, targetMapping: TargetMapping.Target1 }
            ]
        }
    ]
};
    
