import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from '@shared/engine_types';
    export const StadiumTidalmage: CardDefinition = {
    name: "Stadium Tidalmage",
    manaCost: "{2}{U}{R}",
    colors: [
        "R",
        "U"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Djinn",
        "Sorcerer"
    ],
    keywords: [],
    oracleText: "Whenever this creature enters or attacks, you may draw a card. If you do, discard a card.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: ['ON_ETB', 'ON_ATTACK'],
            effects: [
                {
                    type: CostType.Choice,
                    label: "Stadium Tidalmage: Draw and discard?",
                    optional: true,
                    choices: [
                        {
                            label: "Draw 1, then discard 1",
                            effects: [
                                {
                                    type: EffectType.DrawCards,
                                    amount: 1,
                                    targetMapping: TargetMapping.Controller
                                },
                                {
                                    type: EffectType.DiscardCards,
                                    amount: 1,
                                    targetMapping: TargetMapping.Controller
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    power: "4",
    toughness: "4"
};
    