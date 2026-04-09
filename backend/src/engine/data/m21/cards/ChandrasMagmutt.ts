import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const ChandrasMagmutt: Record<string, ImplementableCard> = {
    "Chandra's Magmutt": {
        name: "Chandra's Magmutt",
        manaCost: "{1}{R}",
        oracleText: "{T}: This creature deals 1 damage to target player or planeswalker.",
        colors: ["red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Elemental","Dog"],
        power: "2",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "chandra_magmutt_ping",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Tap', value: null }],
                targetDefinition: { type: 'AnyTarget', count: 1, restrictions: ['Player', 'Planeswalker'] },
                effects: [{ type: 'DealDamage', amount: 1, targetMapping: 'TARGET_1' }]
            }
        ]
    }
};
