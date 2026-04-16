import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const ChandrasOutrage: CardDefinition = {

    name: "Chandra's Outrage",
    manaCost: "{2}{R}{R}",
    oracleText: "Chandra's Outrage deals 4 damage to target creature and 2 damage to that creature's controller.",
    colors: ["R"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    set: "M20",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.Creature, count: 1 },
            effects: [
                { type: EffectType.DealDamage, amount: 4, targetMapping: TargetMapping.Target1 },
                { type: EffectType.DealDamage, amount: 2, targetMapping: TargetMapping.Target1Controller }
            ]
        }
    ]
};


