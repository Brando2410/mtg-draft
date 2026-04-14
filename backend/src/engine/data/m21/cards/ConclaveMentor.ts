import { AbilityType, TriggerEvent, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const ConclaveMentor: Record<string, ImplementableCard> = {
    "Conclave Mentor": {
        name: "Conclave Mentor",
        manaCost: "{G}{W}",
        oracleText: "If one or more +1/+1 counters would be put on a creature you control, that many plus one +1/+1 counters are put on that creature instead.\nWhen this creature dies, you gain life equal to its power.",
        colors: ["green", "white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Centaur", "Cleric"],
        power: "2",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "conclave_mentor_replacement",
                type: AbilityType.Replacement,
                activeZone: ZoneRequirement.Battlefield,
                replacesEvent: 'ON_ADD_COUNTERS',
                condition: (state: any, event: any, source: any) => event.counterType === 'p1p1' && event.target.controllerId === source.controllerId,
                effects: [{ type: 'ModifyCountersAmount', amount: 1, targetMapping: 'TRIGGER_EVENT' }]
            },
            {
                id: "conclave_mentor_death_life",
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Death,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'GainLife', amount: 'POWER', targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};

