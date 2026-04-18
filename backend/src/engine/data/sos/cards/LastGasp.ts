import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const LastGasp: CardDefinition = {
    name: "Last Gasp",
    manaCost: "{1}{B}",
    scryfall_id: "da5f3729-6ec7-4482-90cb-83b973edeae4",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/d/a/da5f3729-6ec7-4482-90cb-83b973edeae4.jpg?1775937510",
    colors: [
        "B"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Target creature gets -3/-3 until end of turn.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    powerModifier: -3,
                    toughnessModifier: -3,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
    
