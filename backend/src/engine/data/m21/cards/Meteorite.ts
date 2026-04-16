import { AbilityType, ZoneRequirement, EffectType, CardDefinition, TargetMapping, TriggerEvent, TargetType } from "@shared/engine_types";

export const Meteorite: CardDefinition = {

    name: "Meteorite",
    manaCost: "{5}",
    oracleText: "When this artifact enters, it deals 2 damage to any target.\n{T}: Add one mana of any color.",
    colors: [],
    supertypes: [],
    types: ["Artifact"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: { type: TargetType.AnyTarget, count: 1 },
            effects: [{
                type: EffectType.DealDamage,
                amount: 2,
                targetMapping: TargetMapping.Target1
            }]
        },
        {

            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Tap' }],
            isManaAbility: true,
            effects: [{
                type: EffectType.AddMana,
                value: '{ANY}',
                amount: 1,
                targetMapping: TargetMapping.Controller
            }]
        }
    ]

};


