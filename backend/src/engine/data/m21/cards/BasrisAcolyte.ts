import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const BasrisAcolyte: Record<string, ImplementableCard> = {
    "Basri's Acolyte": {
        name: "Basri's Acolyte",
        manaCost: "{2}{W}{W}",
        oracleText: "Lifelink (Damage dealt by this creature also causes you to gain that much life.)\nWhen this creature enters, put a +1/+1 counter on each of up to two other target creatures you control.",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Cat", "Cleric"],
        power: "2",
        toughness: "3",
        keywords: ["Lifelink"],
        abilities: [
            {
                id: "basri_acolyte_etb",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                targetDefinition: { type: 'Permanent', count: 2, optional: true, restrictions: ['Creature', 'Other', 'YouControl'] },
                effects: [{ type: 'AddCounters', amount: 1, counterType: 'p1p1', targetMapping: 'TARGET_ALL' }],
            }
        ]
    }
};


