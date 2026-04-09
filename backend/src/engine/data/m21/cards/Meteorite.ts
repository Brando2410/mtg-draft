import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const Meteorite: Record<string, ImplementableCard> = {
    "Meteorite": {
        name: "Meteorite",
        manaCost: "{5}",
        oracleText: "When this artifact enters, it deals 2 damage to any target.\n{T}: Add one mana of any color.",
        colors: [],
        supertypes: [],
        types: ["Artifact"],
        subtypes: [],
        power: "",
        toughness: "",
        keywords: [],
        abilities: [
            {
                id: "meteorite_etb",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                triggerEvent: 'ON_ETB',
                targetDefinition: { type: 'AnyTarget', count: 1 },
                effects: [{
                    type: EffectType.DealDamage,
                    amount: 2,
                    targetMapping: 'TARGET_1'
                }]
            },
            {
                id: "meteorite_mana",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Tap', value: null }],
                isManaAbility: true,
                effects: [{
                    type: EffectType.AddMana,
                    value: 'any',
                    amount: 1,
                    targetMapping: 'CONTROLLER'
                }]
            }
        ]
    }
};
