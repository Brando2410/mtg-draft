import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const AncestralAnger: CardDefinition = {
    name: "Ancestral Anger",
    manaCost: "{R}",
    scryfall_id: "6c5a93d6-d4ab-4062-bb3c-1b5330bf15ad",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/6/c/6c5a93d6-d4ab-4062-bb3c-1b5330bf15ad.jpg?1775937666",
    colors: [
        "R"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Target creature gains trample and gets +X/+0 until end of turn, where X is 1 plus the number of cards named Ancestral Anger in your graveyard.\nDraw a card.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{ type: TargetType.Creature }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.Target1,
                    abilitiesToAdd: ['Trample'],
                    powerModifier: 'GRAVEYARD_NAME_COUNT_PLUS_1',
                    duration: { type: DurationType.UntilEndOfTurn }
                },
                {
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
    
