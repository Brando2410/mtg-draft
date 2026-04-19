import { AbilityType, CardDefinition, DurationType, EffectType, RestrictionType, TargetMapping, TargetType, Zone } from "@shared/engine_types";

export const DestructiveTampering: CardDefinition = {
    name: "Destructive Tampering",
    manaCost: "{2}{R}",
    scryfall_id: "1070ad30-072a-4645-a472-3c354a1ce30a",
    image_url: "https://cards.scryfall.io/normal/front/1/0/1070ad30-072a-4645-a472-3c354a1ce30a.jpg?1594736568",
    oracleText: "Choose one —\n• Destroy target artifact.\n• Creatures without flying can't block this turn.",
    colors: ["R"],
    supertypes: [],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            activeZone: Zone.Hand,
            effects: [
                {
                    type: EffectType.Choice,
                    choices: [
                        {
                            label: "Destroy target artifact",
                            effects: [
                                {
                                    type: EffectType.Destroy,
                                    targetDefinition: {
                                        type: TargetType.Artifact,
                                        count: 1
                                    },
                                    targetMapping: TargetMapping.Target1,
                                }
                            ]
                        },
                        {
                            label: "Creatures without flying can't block this turn",
                            effects: [
                                {
                                    type: EffectType.ApplyContinuousEffect,
                                    duration: { type: DurationType.UntilEndOfTurn },
                                    targetMapping: TargetMapping.AllMatchingPermanents,
                                    restrictions: ["Creature", "WithoutFlying"],
                                    restrictionsToAdd: [{ type: RestrictionType.CannotBlock }],
                                    layer: 6
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
