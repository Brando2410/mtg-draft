import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const WildwoodScourge: CardDefinition = {
    name: "Wildwood Scourge",
    manaCost: "{X}{G}",
    oracleText: "Wildwood Scourge enters the battlefield with X +1/+1 counters on it.\nWhenever one or more +1/+1 counters are put on another non-Hydra creature you control, put a +1/+1 counter on Wildwood Scourge.",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Hydra"],
    power: "0",
    toughness: "0",
    entersWithXCounters: true,
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CountersAddedOther,
            activeZone: Zone.Battlefield,
            condition: (state: any, event: any, source: any) =>
                event.data?.object?.controllerId === source.controllerId &&
                event.counterType === '+1/+1' &&
                !event.data?.object?.definition?.subtypes?.some((s: string) => s.toLowerCase() === 'hydra'),
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 1,
                    counterType: '+1/+1',
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ]
};




