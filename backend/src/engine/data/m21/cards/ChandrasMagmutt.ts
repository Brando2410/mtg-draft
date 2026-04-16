import { AbilityType, ZoneRequirement, EffectType, TargetType, TargetMapping, CardDefinition } from '@shared/engine_types';

export const ChandrasMagmutt: CardDefinition = {

    name: "Chandra's Magmutt",
    manaCost: "{1}{R}",
    oracleText: "{T}: This creature deals 1 damage to target player or planeswalker.",
    colors: ["R"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Elemental", "Dog"],
    power: "2",
    toughness: "2",
    keywords: [],
    abilities: [
        {
            id: "chandra_magmutt_ping",
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Tap' }],
            targetDefinition: { type: TargetType.CreatureOrPlaneswalker, count: 1 },
            effects: [{ type: EffectType.DealDamage, amount: 1, targetMapping: TargetMapping.Target1 }]
        }
    ]

};
