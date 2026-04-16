import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from '@shared/engine_types';
    export const SkycoachWaypoint: CardDefinition = {
    name: "Skycoach Waypoint",
    manaCost: "",
    colors: [],
    types: [
        "Land"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "{T}: Add {C}.\n{3}, {T}: Target creature becomes prepared. (Only creatures with prepare spells can become prepared.)",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            isManaAbility: true,
            effects: [{ type: EffectType.AddMana, manaType: 'C' }]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{3}' },
                { type: CostType.Tap }
            ],
            targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
            effects: [
                {
                    type: EffectType.Prepare,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
    