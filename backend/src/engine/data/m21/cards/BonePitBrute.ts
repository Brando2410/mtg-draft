import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const BonePitBrute: Record<string, ImplementableCard> = {
    "Bone Pit Brute": {
        name: "Bone Pit Brute",
        manaCost: "{4}{R}{R}",
        oracleText: "Menace (This creature can't be blocked except by two or more creatures.)\nWhen this creature enters, target creature gets +4/+0 until end of turn.",
        colors: ["red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Cyclops"],
        power: "4",
        toughness: "5",
        keywords: ["Menace"],
        abilities: [
            {
                id: "bone_pit_brute_etb",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [{ type: 'ApplyContinuousEffect', powerModifier: 4, toughnessModifier: 0, duration: 'UNTIL_END_OF_TURN', layer: 7, targetMapping: 'TARGET_1' }]
            }
        ]
    }
};
