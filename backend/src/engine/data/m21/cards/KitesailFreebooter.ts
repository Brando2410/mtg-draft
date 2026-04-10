import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const KitesailFreebooter: Record<string, ImplementableCard> = {
    "Kitesail Freebooter": {
        name: "Kitesail Freebooter",
        manaCost: "{1}{B}",
        oracleText: "Flying\nWhen Kitesail Freebooter enters the battlefield, target opponent reveals their hand. You choose a noncreature, nonland card from it. Exile that card until Kitesail Freebooter leaves the battlefield.",
        colors: ["black"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Human", "Pirate"],
        power: "1",
        toughness: "2",
        keywords: ["Flying"],
        abilities: [
            {
                id: "kitesail_freebooter_etb",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                triggerEvent: "ON_ETB",
                triggerCondition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                targetDefinition: {
                    type: TargetType.Player,
                    count: 1,
                    minCount: 1,
                    restrictions: ["opponent"]
                },
                effects: [
                    {
                        type: "Choice",
                        label: "Choose a noncreature, nonland card to exile",
                        targetMapping: "TARGET_1",
                        targetIdMapping: "TARGET_1_HAND",
                        restrictions: ["noncreature", "nonland"],
                        effects: [
                            {
                                type: EffectType.MoveToZone,
                                targetMapping: "SELECTED_CARD",
                                destination: Zone.Exile
                            },
                            {
                                type: "AddTriggeredAbility",
                                eventMatch: "ON_LEAVE_BATTLEFIELD",
                                triggerCondition: (state: any, event: any, t: any) => event.sourceId === t.sourceId,
                                effects: [{
                                    type: EffectType.MoveToZone,
                                    destination: Zone.Hand,
                                    targetMapping: "SELECTED_CARD" // Will carry the targetId from the parent choice
                                }],
                                duration: "PERMANENT" // Until it triggers or source is gone
                            }
                        ]
                    }
                ],
                oracleText: "When Kitesail Freebooter enters the battlefield, target opponent reveals their hand. You choose a noncreature, nonland card from it. Exile that card until Kitesail Freebooter leaves the battlefield."
            }
        ]
    }
};
