import { AbilityType, CardDefinition, EffectType, GameEvent, GameObject, TargetType, Zone } from '@shared/engine_types';

export const HeartfireImmolator: CardDefinition = {
        name: "Heartfire Immolator",
        manaCost: "{1}{R}",
        oracleText: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\n{R}, Sacrifice this creature: It deals damage equal to its power to target creature or planeswalker.",
        colors: ["red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Human", "Wizard"],
        power: "2",
        toughness: "2",
        keywords: ["Prowess"],
        abilities: [
            {
                id: "heartfire_immolator_sacrifice",
                type: AbilityType.Activated,
                activeZone: Zone.Battlefield,
                costs: [{ type: 'Mana', value: '{R}' }, { type: 'Sacrifice', targetMapping: 'SELF' }],
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'Planeswalker'] },
                effects: [{ type: 'DealDamage', amount: 'POWER', targetMapping: 'TARGET_1' }]
            }
        ]
    };


