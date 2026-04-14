import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const KineticAugur: Record<string, ImplementableCard> = {
    "Kinetic Augur": {
        name: "Kinetic Augur",
        manaCost: "{3}{R}",
        oracleText: "Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\nKinetic Augur's power is equal to the number of instant and sorcery cards in your graveyard.\nWhen this creature enters, discard up to two cards, then draw that many cards.",
        colors: ["red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Human", "Shaman"],
        power: "*",
        toughness: "4",
        keywords: ["Trample"],
        abilities: [
            {
                id: "kinetic_augur_cda",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        layer: 7,
                        powerDynamic: 'INSTANTS_AND_SORCERIES_IN_GRAVEYARD',
                        targetMapping: 'SELF'
                    }
                ]
            },
            {
                id: "kinetic_augur_etb",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
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
                                    { type: EffectType.DiscardCards, amount: 1, targetMapping: 'CONTROLLER' },
                                    { type: EffectType.DrawCards, amount: 1, targetMapping: 'CONTROLLER' }
                                ]
                            },
                            {
                                label: "Discard 2",
                                effects: [
                                    { type: EffectType.DiscardCards, amount: 2, targetMapping: 'CONTROLLER' },
                                    { type: EffectType.DrawCards, amount: 2, targetMapping: 'CONTROLLER' }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
};


