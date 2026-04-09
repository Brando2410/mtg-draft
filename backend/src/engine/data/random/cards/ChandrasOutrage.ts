import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const ChandrasOutrage: Record<string, ImplementableCard> = {
    "Chandra's Outrage": {
        name: "Chandra's Outrage",
        manaCost: "{2}{R}{R}",
        oracleText: "Chandra's Outrage deals 4 damage to target creature and 2 damage to that creature's controller.",
        colors: ["red"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        set: "M20",
        abilities: [
            {
                id: "chandra_outrage_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [
                    { type: 'DealDamage', amount: 4, targetMapping: 'TARGET_1' },
                    { type: 'DealDamage', amount: 2, targetMapping: 'TARGET_1_CONTROLLER' }
                ]
            }
        ]
    }
};
