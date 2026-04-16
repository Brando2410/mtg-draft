import { AbilityType, CardDefinition, CostType, TargetType } from '@shared/engine_types';
    export const EndoftheHunt: CardDefinition = {
    name: "End of the Hunt",
    manaCost: "{1}{B}",
    colors: [
        "B"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Target opponent exiles a creature or planeswalker they control with the highest mana value among creatures and planeswalkers they control.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Player,
                count: 1,
                restrictions: ['Opponent']
            },
            effects: [
                {
                    type: CostType.Exile,
                    targetMapping: 'TARGET_1_HIGHEST_MV_CREATURE_PLANESWALKER'
                }
            ]
        }
    ]
};
    