import { CardDefinition, AbilityType, Zone, EffectType, TriggerEvent, TargetType, TargetMapping } from "@shared/engine_types";

export const KitesailFreebooter: CardDefinition = {
    name: "Kitesail Freebooter",
    manaCost: "{1}{B}",
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
