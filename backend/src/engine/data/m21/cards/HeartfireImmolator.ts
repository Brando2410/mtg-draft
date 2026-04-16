import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const HeartfireImmolator: CardDefinition = {
    name: "Heartfire Immolator",
    manaCost: "{1}{R}",
    oracleText: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\n{R}, Sacrifice this creature: It deals damage equal to its power to target creature or planeswalker.",
    colors: ["R"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Human", "Wizard"],
    power: "2",
    toughness: "2",
    keywords: ["Prowess"],
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{R}' }, { type: CostType.SacrificeSelf }],
            targetDefinition: { type: TargetType.CreatureOrPlaneswalker, count: 1 },
            effects: [{ type: EffectType.DealDamage, amount: 'POWER', targetMapping: TargetMapping.Target1 }]
        }
    ]
};


