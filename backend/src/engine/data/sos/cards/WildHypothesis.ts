import { AbilityType, CardDefinition, CounterType, DynamicAmount, EffectType, TargetMapping } from '@shared/engine_types';
export const WildHypothesis: CardDefinition = {
    name: "Wild Hypothesis",
    manaCost: "{X}{G}",
    colors: ["G"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it.\nSurveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 1,
                    tokenBlueprint: {
                        name: 'Fractal',
                        types: ['Creature'],
                        subtypes: ['Fractal'],
                        colors: ['G', 'U'],
                        power: 0,
                        toughness: 0,
                        image_url: "https://cards.scryfall.io/normal/front/8/b/8b5f1fdb-04df-4224-acb4-7819c37565f5.jpg?1775828306"
                    },
                    startingCounters: { counterType: CounterType.P1P1, amount: DynamicAmount.X },

                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.Surveil,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "04fdfabc-c247-4384-a5bb-f49035f8aae0",
    image_url: "https://cards.scryfall.io/normal/front/0/4/04fdfabc-c247-4384-a5bb-f49035f8aae0.jpg?1775938142",
    rarity: "common"
};

