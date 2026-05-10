import { AbilityType, CardDefinition, CounterType, DynamicAmount, EffectType, TargetMapping } from '@shared/engine_types';
export const SnarlSong: CardDefinition = {
    name: "Snarl Song",
    manaCost: "{5}{G}",
    colors: ["G"],
    types: ["Sorcery"],
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
                        image_url: "https://cards.scryfall.io/normal/front/d/e/de564776-9d88-4533-8717-842eecdd0594.jpg?1775828279"
                    },
                    startingCounters: { counterType: CounterType.P1P1, amount: DynamicAmount.ConvergeAmount },

                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.GainLife,
                    amount: DynamicAmount.ConvergeAmount,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "fc4c7fa2-aebb-4636-9afd-f1010c923316",
    image_url: "https://cards.scryfall.io/normal/front/f/c/fc4c7fa2-aebb-4636-9afd-f1010c923316.jpg?1775938101",
    rarity: "uncommon"
};

