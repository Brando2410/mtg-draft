import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const Shock: Record<string, ImplementableCard> = {
    "Shock": {
        name: "Shock",
        manaCost: "{R}",
        oracleText: "Shock deals 2 damage to any target.",
        colors: ["red"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "shock_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'AnyTarget', count: 1 },
                effects: [{ type: 'DealDamage', amount: 2, targetMapping: 'TARGET_1' }]
            }
        ]
    }
};
