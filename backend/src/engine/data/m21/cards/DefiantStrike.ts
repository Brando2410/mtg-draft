import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const DefiantStrike: Record<string, ImplementableCard> = {
    "Defiant Strike": {
        name: "Defiant Strike",
        manaCost: "{W}",
        oracleText: "Target creature gets +1/+0 until end of turn.\nDraw a card.",
        colors: ["white"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "defiant_strike_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [
                    { type: 'ApplyContinuousEffect', powerModifier: 1, toughnessModifier: 0, duration: 'UNTIL_END_OF_TURN', layer: 7, targetMapping: 'TARGET_1' },
                    { type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    }
};
