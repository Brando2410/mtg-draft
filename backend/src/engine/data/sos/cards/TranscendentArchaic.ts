import { AbilityType, CardDefinition, CostType, DynamicAmount, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const TranscendentArchaic: CardDefinition = {
    name: "Transcendent Archaic",
    manaCost: "{7}",
    colors: [],
    types: [
        "Creature"
    ],
    subtypes: [
        "Avatar"
    ],
    keywords: ["Vigilance"],
    oracleText: "Vigilance\nConverge — When this creature enters, you may draw X cards, where X is the number of colors of mana spent to cast this spell. If you draw one or more cards this way, discard two cards.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: CostType.Choice,
                    label: "Draw cards based on Converge?",
                    choices: [
                        {
                            label: "Yes",
                            effects: [
                                {
                                    type: EffectType.DrawCards,
                                    amount: DynamicAmount.ConvergeAmount,
                                    targetMapping: TargetMapping.Controller
                                },
                                {
                                    type: EffectType.ConditionalEffect,
                                    condition: 'CONVERGE_GE:1',
                                    effects: [
                                        {
                                            type: EffectType.DiscardCards,
                                            amount: 2,
                                            targetMapping: TargetMapping.Controller
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            label: "No",
                            effects: []
                        }
                    ]
                }
            ]
        }
    ],
    power: "6",
    toughness: "6",
    scryfall_id: "1624c680-502b-474a-b9b2-888fe3ca008c",
    image_url: "https://cards.scryfall.io/normal/front/1/6/1624c680-502b-474a-b9b2-888fe3ca008c.jpg?1775936948",
    rarity: "uncommon"
};

