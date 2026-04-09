import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const BoltHound: Record<string, ImplementableCard> = {
    "Bolt Hound": {
        name: "Bolt Hound",
        manaCost: "{2}{R}",
        oracleText: "Haste (This creature can attack and {T} as soon as it comes under your control.)\nWhenever this creature attacks, other creatures you control get +1/+0 until end of turn.",
        colors: ["red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Elemental","Dog"],
        power: "2",
        toughness: "2",
        keywords: ["Haste"],
        abilities: [
            {
                id: "bolt_hound_attack_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ATTACK',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                effects: [{ type: 'ApplyContinuousEffect', powerModifier: 1, toughnessModifier: 0, duration: 'UNTIL_END_OF_TURN', layer: 7, targetMapping: 'OTHER_CREATURES_YOU_CONTROL' }]
            }
        ]
    }
};
