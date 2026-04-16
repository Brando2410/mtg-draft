import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';


export const ChandrasMagmutt: CardDefinition = {
    name: "Chandra's Magmutt",
    manaCost: "{1}{R}",
    oracleText: "{T}: This creature deals 1 damage to target player or planeswalker.",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Elemental", "Dog"],
    power: "2",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [{ type: CostType.Tap }],

            targetDefinition: {
                type: TargetType.AnyTarget,
                count: 1,
                restrictions: ['Player', 'Planeswalker']
            },


            effects: [{
                type: EffectType.DealDamage,
                amount: 1,
                targetMapping: TargetMapping.Target1
            }]
        }
    ]
};

