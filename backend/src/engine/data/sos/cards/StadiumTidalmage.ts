import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const StadiumTidalmage: CardDefinition = {
    name: "Stadium Tidalmage",
    manaCost: "{2}{U}{R}",
    colors: ["R", "U"],
    types: ["Creature"],
    subtypes: ["Djinn", "Sorcerer"],
    power: "4",
    toughness: "4",
    keywords: [],
    oracleText: "Whenever this creature enters or attacks, you may draw a card. If you do, discard a card.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: [TriggerEvent.EnterBattlefield, TriggerEvent.Attack],
            condition: ConditionType.SelfAttacks,
            effects: [
                {
                    type: EffectType.Choice,
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
    scryfall_id: "a689289e-7141-4950-8a87-82e9bd6846fe",
    image_url: "https://cards.scryfall.io/normal/front/a/6/a689289e-7141-4950-8a87-82e9bd6846fe.jpg?1775938619",
    rarity: "common"
};

