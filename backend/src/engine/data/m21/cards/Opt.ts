import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const Opt: CardDefinition = {
    name: "Opt",
    manaCost: "{U}",

    oracleText: "Scry 1. (Look at the top card of your library. You may put that card on the bottom.)\nDraw a card.",
    colors: ["U"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                { type: EffectType.Scry, amount: 1, targetMapping: TargetMapping.Controller },
                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        }
    ],
    scryfall_id: "bbc99a51-1501-4525-a3cc-f48249b64bed",
    image_url: "https://cards.scryfall.io/normal/front/b/b/bbc99a51-1501-4525-a3cc-f48249b64bed.jpg?1743206354",
    rarity: "common"
};

