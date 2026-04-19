import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from "@shared/engine_types";

export const KitesailFreebooter: CardDefinition = {
    name: "Kitesail Freebooter",
    manaCost: "{1}{B}",
    scryfall_id: "88496096-fd9a-451a-85d9-31ccc3580623",
    image_url: "https://cards.scryfall.io/normal/front/8/8/88496096-fd9a-451a-85d9-31ccc3580623.jpg?1594736212",
    oracleText: "Flying\nWhen Kitesail Freebooter enters the battlefield, target opponent reveals their hand. You choose a noncreature, nonland card from it. Exile that card until Kitesail Freebooter leaves the battlefield.",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Human", "Pirate"],
    power: "1",
    toughness: "2",
    keywords: ["Flying"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: {
                type: TargetType.Player,
                count: 1,
                restrictions: [{ type: 'Opponent' }]
            },
            effects: [
                {
                    type: EffectType.ExileUntilLeaves,
                    sourceZone: Zone.Hand,
                    returnZone: Zone.Hand,
                    targetDefinition: {
                        type: TargetType.Card,
                        restrictions: [
                            { type: 'Not', restriction: { type: 'Type', value: 'Creature' } },
                            { type: 'Not', restriction: { type: 'Type', value: 'Land' } }
                        ],
                        count: 1
                    },
                    targetMapping: TargetMapping.Target1, // Player to reveal hand from
                    reveal: true,
                    zone: Zone.Exile
                }
            ]
        }
    ]
};
