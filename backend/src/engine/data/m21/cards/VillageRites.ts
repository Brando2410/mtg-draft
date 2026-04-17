import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from '@shared/engine_types';


export const VillageRites: CardDefinition = {
    name: "Village Rites",
    manaCost: "{B}",
    oracleText: "As an additional cost to cast this spell, sacrifice a creature.\nDraw two cards.",
    colors: ["B"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            costs: [{ type: CostType.Sacrifice, restrictions: [
                { type: 'Type', value: 'Creature' }
            ] }],

            effects: [{ type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Controller }]
        }
    ]

};

