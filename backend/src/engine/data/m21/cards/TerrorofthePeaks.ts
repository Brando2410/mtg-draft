import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const TerrorofthePeaks: Record<string, ImplementableCard> = {
    "Terror of the Peaks": {
        name: "Terror of the Peaks",
        manaCost: "{3}{R}{R}",
        oracleText: "Spells your opponents cast that target Terror of the Peaks cost an additional 3 life to cast.\nWhenever another creature enters the battlefield under your control, Terror of the Peaks deals damage equal to that creature's power to any target.",
        colors: ["red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Dragon"],
        power: "5",
        toughness: "4",
        keywords: ["Flying"],
        abilities: [
            {
                id: "terror_peaks_tax",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{
                    type: 'AdditionalCost',
                    targetMapping: 'EACH_OPPONENT',
                    condition: 'SPELL_TARGETS_SOURCE',
                    additionalCosts: [{ type: 'PayLife', value: '3' }]
                } as any]
            },
            {
                id: "terror_peaks_etb_damage",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB_OTHER',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) =>
                    event.data?.object?.controllerId === source.controllerId &&
                    event.data?.object?.definition?.types?.some((t: string) => t.toLowerCase() === 'creature'),
                targetDefinition: { type: 'AnyTarget', count: 1 },
                effects: [{ type: 'DealDamage', amount: 'EVENT_OBJECT_POWER', targetMapping: 'ANY_TARGET' }]
            }
        ]
    }
};
