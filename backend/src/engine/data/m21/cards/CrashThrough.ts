import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping } from '@shared/engine_types';

export const CrashThrough: CardDefinition = {
    name: "Crash Through",
    manaCost: "{R}",

    oracleText: "Creatures you control gain trample until end of turn. (Each of those creatures can deal excess combat damage to the player or planeswalker it's attacking.)\nDraw a card.",
    colors: ["R"],
    types: ["Sorcery"],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    abilitiesToAdd: ['Trample'],
                    duration: { type: DurationType.UntilEndOfTurn },
                    layer: 6,
                    targetMapping: TargetMapping.AllCreaturesYouControl
                },
                {
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "8257c205-00cd-4d41-bd58-098575ea2343",
    image_url: "https://cards.scryfall.io/normal/front/8/2/8257c205-00cd-4d41-bd58-098575ea2343.jpg?1594736580",
    rarity: "common"
};

