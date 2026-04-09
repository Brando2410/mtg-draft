import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const Pridemalkin: Record<string, ImplementableCard> = {
    "Pridemalkin": {
        name: "Pridemalkin",
        manaCost: "{2}{G}",
        oracleText: "When this creature enters, put a +1/+1 counter on target creature you control. Each creature you control with a +1/+1 counter on it has trample.",
        colors: ["green"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Cat"],
        power: "2",
        toughness: "1",
        keywords: [],
        abilities: [
            {
                id: "pridemalkin_etb",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                triggerEvent: 'ON_ETB',
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'Controller'] },
                effects: [{
                    type: EffectType.AddCounters,
                    value: '+1/+1',
                    amount: 1,
                    targetMapping: 'TARGET_1'
                }]
            },
            {
                id: "pridemalkin_trample_lord",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    layer: 6,
                    abilitiesToAdd: ['Trample'],
                    targetMapping: 'MATCHING_PERMANENTS_YOU_CONTROL',
                    restrictions: ['Creature', 'HasCounter_+1/+1']
                }]
            }
        ]
    }
};
