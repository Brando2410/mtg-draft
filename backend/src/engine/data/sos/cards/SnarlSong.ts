import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping } from '@shared/engine_types';
    export const SnarlSong: CardDefinition = {
    name: "Snarl Song",
    manaCost: "{5}{G}",
    colors: [
        "G"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Converge — Create two 0/0 green and blue Fractal creature tokens. Put X +1/+1 counters on each of them and you gain X life, where X is the number of colors of mana spent to cast this spell.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 2,
                    tokenBlueprint: {
                        name: "Fractal",
                        types: ["Creature"],
                        subtypes: ["Fractal"],
                        colors: ["G", "U"],
                        power: "0",
                        toughness: "0",
                        image_url: "https://cards.scryfall.io/png/front/9/1/910f48ab-b04e-4874-b31d-a86a7bc5af14.png?1682693894"
                    },
                    startingCounters: { type: 'p1p1', amount: DynamicAmount.ConvergeAmount },
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.GainLife,
                    amount: DynamicAmount.ConvergeAmount,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
    
