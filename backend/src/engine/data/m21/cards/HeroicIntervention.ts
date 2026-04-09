import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const HeroicIntervention: Record<string, ImplementableCard> = {
    "Heroic Intervention": {
        name: "Heroic Intervention",
        manaCost: "{1}{G}",
        oracleText: "Permanents you control gain hexproof and indestructible until end of turn.",
        colors: ["green"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "heroic_intervention_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [
                    { type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Hexproof', 'Indestructible'], layer: 6, targetMapping: 'ALL_PERMANENTS_YOU_CONTROL' }
                ]
            }
        ]
    }
};
