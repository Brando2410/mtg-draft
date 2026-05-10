import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const TeferisTutelage: CardDefinition = {
    name: "Teferi's Tutelage",
    manaCost: "{2}{U}",

    oracleText: "When Teferi's Tutelage enters the battlefield, draw a card, then discard a card.\nWhenever you draw a card, target opponent mills two cards.",
    colors: ["U"],
    types: ["Enchantment"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
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
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Draw,
            condition: ConditionType.PlayerIsController,
            targetDefinitions: [{ type: TargetType.Opponent, count: 1 }],
            effects: [{
                type: EffectType.Mill,
                amount: 2,
                targetMapping: TargetMapping.Target1
            }]
        }
    ],
    scryfall_id: "c26450d4-125f-423d-b074-3c959460c242",
    image_url: "https://cards.scryfall.io/normal/front/c/2/c26450d4-125f-423d-b074-3c959460c242.jpg?1594735840",
    rarity: "uncommon"
};

