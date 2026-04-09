import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const IgneousCur: Record<string, ImplementableCard> = {
    "Igneous Cur": {
        name: "Igneous Cur",
        manaCost: "{1}{R}",
        oracleText: "{1}{R}: This creature gets +2/+0 until end of turn.",
        colors: ["red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Elemental","Dog"],
        power: "1",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "igneous_cur_buff",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{1}{R}' }],
                effects: [{ type: 'ApplyContinuousEffect', powerModifier: 2, toughnessModifier: 0, duration: 'UNTIL_END_OF_TURN', layer: 7, targetMapping: 'SELF' }]
            }
        ]
    }
};
