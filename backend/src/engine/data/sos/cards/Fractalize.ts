import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const Fractalize: CardDefinition = {
    name: "Fractalize",
    manaCost: "{X}{U}",


    colors: [
        "U"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Until end of turn, target creature becomes a green and blue Fractal with base power and toughness each equal to X plus 1. (It loses all other colors and creature types.)",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1
            }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.Target1,
                    duration: { type: DurationType.UntilEndOfTurn },
                    powerSet: 'X_PLUS_1',
                    toughnessSet: 'X_PLUS_1',
                    colorSet: ['G', 'U'],
                    subtypesSet: ['Fractal']
                }
            ]
        }
    ],
    scryfall_id: "e3c3b19b-01b6-4f5a-b428-513b778c5d89",
    image_url: "https://cards.scryfall.io/normal/front/e/3/e3c3b19b-01b6-4f5a-b428-513b778c5d89.jpg?1775937264",
    rarity: "uncommon"
};

