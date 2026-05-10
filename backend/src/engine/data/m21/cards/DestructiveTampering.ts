import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, RestrictionType, TargetMapping, TargetType } from "@shared/engine_types";

export const DestructiveTampering: CardDefinition = {
    name: "Destructive Tampering",
    manaCost: "{2}{R}",
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
                                    targetDefinitions: [{
                                        type: TargetType.Artifact,
                                        count: 1
                                    }]
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
    ],
    scryfall_id: "bfe6a3a9-8d62-47c4-a78b-9baa9133a540",
    image_url: "https://cards.scryfall.io/normal/front/b/f/bfe6a3a9-8d62-47c4-a78b-9baa9133a540.jpg?1594736589",
    rarity: "common"
};

