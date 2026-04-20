import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, RestrictionType, TargetMapping, TargetType } from "@shared/engine_types";

export const DestructiveTampering: CardDefinition = {
    name: "Destructive Tampering",
    manaCost: "{2}{R}",
    scryfall_id: "1070ad30-072a-4645-a472-3c354a1ce30a",
    image_url: "https://cards.scryfall.io/normal/front/1/0/1070ad30-072a-4645-a472-3c354a1ce30a.jpg?1594736568",
    oracleText: "Choose one —\n• Destroy target artifact.\n• Creatures without flying can't block this turn.",
    colors: ["R"],
    types: ["Sorcery"],
    abilities: [
        {
            type: AbilityType.Spell,
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
                                    }
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
                                    restrictions: [Restriction.Creature, Restriction.WithoutFlying],
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
