import { AbilityType, CardDefinition, EffectType, GameEvent, GameObject, TargetType, Zone } from '@shared/engine_types';

export const DaybreakCharger: CardDefinition = {
        name: "Daybreak Charger",
        manaCost: "{1}{W}",
        oracleText: "When this creature enters, target creature gets +2/+0 until end of turn.",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Unicorn"],
        power: "3",
        toughness: "1",
        keywords: [],
        abilities: [
            {
                id: "daybreak_charger_etb",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ETB',
                activeZone: Zone.Battlefield,
                condition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', powerModifier: 2, toughnessModifier: 0, layer: 7, targetMapping: 'TARGET_1' }]
            }
        ]
    };




