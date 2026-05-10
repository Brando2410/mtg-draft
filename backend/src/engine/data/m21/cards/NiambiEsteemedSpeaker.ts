import { AbilityType, CardDefinition, CostType, DynamicAmount, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const NiambiEsteemedSpeaker: CardDefinition = {
    name: "Niambi, Esteemed Speaker",
    manaCost: "{W}{U}",

    oracleText: "Flash\nWhen Niambi enters, you may return another target creature you control to its owner's hand. If you do, you gain life equal to that creature's mana value.\n{1}{W}{U}, {T}, Discard a legendary card: Draw two cards.",
    colors: ["W", "U"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Human", "Cleric"],
    power: "2",
    toughness: "1",
    keywords: ["Flash"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1,
                optional: true,
                restrictions: [Restriction.YouControl, Restriction.Other]
            }],
            effects: [
                { type: EffectType.ReturnToHand, targetMapping: TargetMapping.Target1 },
                {
                    type: EffectType.GainLife,
                    amount: DynamicAmount.Target1ManaValue,
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{1}{W}{U}' },
                { type: CostType.Tap },
                { type: CostType.Discard, restrictions: [Restriction.Legendary] }
            ],
            effects: [{ type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Controller }]
        }
    ],
    scryfall_id: "e21827eb-fa49-4784-a86b-aef164a5018e",
    image_url: "https://cards.scryfall.io/normal/front/e/2/e21827eb-fa49-4784-a86b-aef164a5018e.jpg?1594737411",
    rarity: "rare"
};

