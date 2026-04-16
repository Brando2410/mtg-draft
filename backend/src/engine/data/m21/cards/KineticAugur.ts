import { AbilityType, ZoneRequirement, Zone, EffectType, TargetMapping, TriggerEvent, CardDefinition } from "@shared/engine_types";

export const KineticAugur: CardDefinition = {

    name: "Kinetic Augur",
    manaCost: "{3}{R}",
    oracleText: "Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\nKinetic Augur's power is equal to the number of instant and sorcery cards in your graveyard.\nWhen this creature enters, discard up to two cards, then draw that many cards.",
    colors: ["R"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Human", "Shaman"],
    power: "*",
    toughness: "4",
    keywords: ["Trample"],
    abilities: [
        {
            type: AbilityType.Static,
            activeZone: ZoneRequirement.Battlefield,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 7,
                    powerDynamic: 'INSTANTS_AND_SORCERIES_IN_GRAVEYARD',
                    targetMapping: TargetMapping.Self
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            activeZone: Zone.Battlefield,
            condition: (state: any, event: any, source: any) => {
                return event.data?.object?.id === source.sourceId;
            },
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Discard up to two cards, then draw that many.",
                    choices: [
                        {
                            label: "Discard 0",
                            effects: []
                        },
                        {
                            label: "Discard 1",
                            effects: [
                                { type: EffectType.DiscardCards, amount: 1, targetMapping: TargetMapping.Controller },
                                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }
                            ]
                        },
                        {
                            label: "Discard 2",
                            effects: [
                                { type: EffectType.DiscardCards, amount: 2, targetMapping: TargetMapping.Controller },
                                { type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Controller }
                            ]
                        }
                    ]
                }
            ]
        }
    ]

};


