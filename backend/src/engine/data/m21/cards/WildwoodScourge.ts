import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const WildwoodScourge: Record<string, ImplementableCard> = {
    "Wildwood Scourge": {
        name: "Wildwood Scourge",
        manaCost: "{X}{G}",
        oracleText: "Wildwood Scourge enters the battlefield with X +1/+1 counters on it.\nWhenever one or more +1/+1 counters are put on another non-Hydra creature you control, put a +1/+1 counter on Wildwood Scourge.",
        colors: ["green"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Hydra"],
        power: "0",
        toughness: "0",
        keywords: [],
        abilities: [
            {
                id: "wildwood_scourge_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_COUNTERS_ADDED_OTHER',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) =>
                    event.data?.object?.controllerId === source.controllerId &&
                    event.counterType === '+1/+1' &&
                    !event.data?.object?.definition?.subtypes?.includes('Hydra'),
                effects: [{ type: 'AddCounters', amount: 1, value: '+1/+1', targetMapping: 'SELF' }]
            }
        ]
    }
};
