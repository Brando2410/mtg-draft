import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType, Restriction } from '@shared/engine_types';

export const CelestialEnforcer: Record<string, ImplementableCard> = {
    "Celestial Enforcer": {
        name: "Celestial Enforcer",
        manaCost: "{2}{W}",
        oracleText: "{1}{W}, {T}: Tap target creature. Activate only if you control a creature with flying.",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Human","Cleric"],
        power: "2",
        toughness: "3",
        keywords: [],
        abilities: [
            {
                id: "celestial_enforcer_tap",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{1}{W}' }, { type: 'Tap', value: null }],
                condition: (state: any, event: any, source: any) => {
                    // Rule 602.2: Activated abilities can have activation requirements
                    return state.battlefield.some((o: any) => o.controllerId === source.controllerId && (state.effectiveStats?.[o.id]?.keywords || []).includes('Flying'));
                },
                targetDefinition: { type: TargetType.Creature, count: 1 },
                effects: [{ type: EffectType.Tapped, value: true, targetMapping: 'TARGET_1' }]
            }
        ]
    }
};

