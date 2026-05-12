import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';

export const ApproachOfTheSecondSun: CardDefinition = {
    name: "Approach of the Second Sun",
    manaCost: "{6}{W}",
    oracleText: "If this spell was cast from your hand and you’ve cast another spell named Approach of the Second Sun this game, you win the game. Otherwise, put Approach of the Second Sun into its owner’s library seventh from the top and you gain 7 life.",
    colors: ["W"],
    types: ["Sorcery"],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.ApproachOfTheSecondSun
                }
            ]
        }
    ],
    set: "soa",
    scryfall_id: "fdf59a6e-7708-45a1-884d-d12e9f7b9ed9",
    image_url: "https://cards.scryfall.io/normal/front/f/d/fdf59a6e-7708-45a1-884d-d12e9f7b9ed9.jpg?1543674579",
    rarity: "rare"
};

