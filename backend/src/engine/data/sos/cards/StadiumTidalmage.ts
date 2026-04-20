import { AbilityType, CardDefinition, ConditionType, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
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
                    label: "Choose an option:",
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
                        },
                        {
                            label: "Decline",
                            effects: []
                        }
                    ]
                }
            ]
        }
    ]
};

