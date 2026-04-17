import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const AnimalSanctuary: CardDefinition = {

    name: "Animal Sanctuary",
    manaCost: "",
    oracleText: "{T}: Add {C}.\n{2}, {T}: Put a +1/+1 counter on target Bird, Cat, Dog, Goat, Ox, or Snake.",
    colors: [],
    supertypes: [],
    types: ["Land"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            effects: [{ type: EffectType.AddMana, amount: '{C}', targetMapping: TargetMapping.Controller }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{2}' }, { type: CostType.Tap }],
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
                restrictions: [
                    {
                        type: 'Any',
                        restrictions: [
                            { type: 'Subtype', value: 'Bird' },
                            { type: 'Subtype', value: 'Cat' },
                            { type: 'Subtype', value: 'Dog' },
                            { type: 'Subtype', value: 'Goat' },
                            { type: 'Subtype', value: 'Ox' },
                            { type: 'Subtype', value: 'Snake' }
                        ]
                    }
                ]
            },
            effects: [{ type: EffectType.AddCounters, counterType: 'p1p1', amount: 1, targetMapping: TargetMapping.Target1 }]
        }
    ]

};
