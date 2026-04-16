import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, CostType, DurationType } from '@shared/engine_types';

export const PrimalMight: CardDefinition = {
    name: "Primal Might",
    manaCost: "{X}{G}",
    oracleText: "Target creature you control gets +X/+X until end of turn. Then it fights up to one target creature you don't control. (Each deals damage equal to its power to the other.)",
    colors: ["G"],
    supertypes: [],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            costs: [{ type: CostType.Mana, value: '{X}{G}' }],
            targetDefinition: {
                type: TargetType.Permanent,
                count: 2,
                perTargetRestrictions: [
                    ['Creature', 'YouControl'],
                    ['Creature', 'OpponentControl']
                ]
            },
            effects: [
                { type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, powerModifier: 'X', toughnessModifier: 'X', layer: 7, targetMapping: TargetMapping.Target1 },
                { type: EffectType.Fight, targetMapping: TargetMapping.Target1, target2Mapping: TargetMapping.Target2 }
            ]
        }
    ]
};


