import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping } from '@shared/engine_types';
    export const Flashback: CardDefinition = {
    name: "Flashback",
    manaCost: "{R}",
    colors: [
        "R"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Target instant or sorcery card in your graveyard gains flashback until end of turn. The flashback cost is equal to its mana cost. (You may cast that card from your graveyard for its flashback cost. Then exile it.)",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: CostType.Choice,
                    label: "Choose an instant or sorcery card in your graveyard",
                    targetIdMapping: 'CONTROLLER_GRAVEYARD',
                    restrictions: [
                { type: 'Type', value: 'InstantOrSorcery' }
            ],
                    optional: false,
                    effects: [
                        {
                            type: EffectType.ApplyContinuousEffect,
                            targetMapping: TargetMapping.Target1,
                            duration: { type: DurationType.UntilEndOfTurn },
                            abilitiesToAdd: ['Flashback'],
                            flashbackCostOverride: 'SOURCE_MANA_COST'
                        }
                    ]
                }
            ]
        }
    ]
};
    