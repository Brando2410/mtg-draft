import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const Opt: CardDefinition = {
    name: "Opt",
    manaCost: "{U}",
    scryfall_id: "323db259-d35e-467d-9a46-4adcb2fc107c",
    image_url: "https://cards.scryfall.io/normal/front/3/2/323db259-d35e-467d-9a46-4adcb2fc107c.jpg?1652898493",
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
    ]
};
