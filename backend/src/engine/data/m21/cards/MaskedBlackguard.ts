import { AbilityType, ZoneRequirement, EffectType, CardDefinition, TargetMapping, DurationType } from "@shared/engine_types";

export const MaskedBlackguard: CardDefinition = {

    name: "Masked Blackguard",
    manaCost: "{1}{B}",
    oracleText: "Flash (You may cast this spell any time you could cast an instant.)\n{2}{B}: This creature gets +1/+1 until end of turn.",
    colors: ["B"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Human", "Rogue"],
    power: "2",
    toughness: "1",
    keywords: ["Flash"],
    abilities: [
        {

            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [
                { type: 'Mana', value: '{2}{B}' }
            ],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    toughnessModifier: 1,
                    duration: DurationType.UntilEndOfTurn,
                    targetMapping: TargetMapping.Self
                }
            ],
        }
    ]

};
