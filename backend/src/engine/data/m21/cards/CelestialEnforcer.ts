import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const CelestialEnforcer: CardDefinition = {

    name: "Celestial Enforcer",
    manaCost: "{2}{W}",
    oracleText: "{1}{W}, {T}: Tap target creature. Activate only if you control a creature with flying.",
    colors: ["W"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Human", "Cleric"],
    power: "2",
    toughness: "3",
    keywords: [],
    abilities: [
        {
            id: "celestial_enforcer_tap",
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [{ type: 'Mana', value: '{1}{W}' }, { type: 'Tap' }],
            condition: (state: any, event: any, source: any) => {
                // Rule 602.2: Activated abilities can have activation requirements
                return state.battlefield.some((o: any) => o.controllerId === source.controllerId && (state.effectiveStats?.[o.id]?.keywords || []).includes('Flying'));
            },
            targetDefinition: { type: TargetType.Creature, count: 1 },
            effects: [{ type: EffectType.Tap, targetMapping: TargetMapping.Target1 }]
        }
    ]
};



