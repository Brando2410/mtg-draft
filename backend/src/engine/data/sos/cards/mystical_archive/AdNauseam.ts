import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';

export const AdNauseam: CardDefinition = {
    name: "Ad Nauseam",
    manaCost: "{3}{B}{B}",
    oracleText: "Reveal the top card of your library and put that card into your hand. You lose life equal to its mana value. You may repeat this process any number of times.",
    colors: ["B"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.AdNauseam
                }
            ]
        }
    ]
};
