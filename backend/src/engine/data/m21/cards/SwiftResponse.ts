import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const SwiftResponse: Record<string, ImplementableCard> = {
    "Swift Response": {
        name: "Swift Response",
        manaCost: "{1}{W}",
        oracleText: "Destroy target tapped creature.",
        colors: ["white"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "swift_response_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'Tapped'] },
                effects: [{ type: 'Destroy', targetMapping: 'TARGET_1' }]
            }
        ]
    }
};
