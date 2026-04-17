import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const MasterfulFlourish: CardDefinition = {
    name: "Masterful Flourish",
    manaCost: "{B}",
    scryfall_id: "8d93d14d-7760-4af2-a237-2df326dd28d3",
    image_url: "https://cards.scryfall.io/normal/front/8/d/8d93d14d-7760-4af2-a237-2df326dd28d3.jpg?1775937531",
    colors: [
        "B"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Target creature you control gets +1/+0 and gains indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy it.)",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.Creature, restrictions: [
                "youcontrol"
            ], count: 1 },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    abilitiesToAdd: ["Indestructible"],
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
    
