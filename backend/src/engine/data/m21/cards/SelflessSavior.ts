import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const SelflessSavior: Record<string, ImplementableCard> = {
    "Selfless Savior": {
        name: "Selfless Savior",
        manaCost: "{W}",
        oracleText: "Sacrifice Selfless Savior: Another target creature you control gains indestructible until end of turn.",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Dog"],
        power: "1",
        toughness: "1",
        keywords: [],
        abilities: [
            {
                id: "selfless_savior_sac",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Sacrifice', restrictions: ['SELF'] }],
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'Another'] },
                effects: [{ type: 'ApplyContinuousEffect', abilitiesToAdd: ['Indestructible'], duration: 'UNTIL_END_OF_TURN', layer: 6, targetMapping: 'TARGET_1' }]
            }
        ]
    }
};
