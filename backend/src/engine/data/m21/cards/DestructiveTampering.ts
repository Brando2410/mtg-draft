import {AbilityType, Zone, CardDefinition, EffectType, GameEvent, GameObject, TargetType, DurationType, Restriction} from "@shared/engine_types";

export const DestructiveTampering: CardDefinition = {
        name: "Destructive Tampering",
        manaCost: "{2}{R}",
        oracleText: "Choose one —\n• Destroy target artifact.\n• Creatures without flying can’t block this turn.",
        colors: ["red"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        power: "",
        toughness: "",
        keywords: [],
        abilities: [
            {
                id: "destructive_tampering_spell",
                type: AbilityType.Spell,
                activeZone: Zone.Hand,
                effects: [
                    {
                        type: EffectType.Choice,
                        label: "Choose one:",
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
                                        targetMapping: "TARGET_1"
                                    }
                                ]
                            },
                            {
                                label: "Creatures without flying can't block this turn",
                                effects: [
                                    {
                                        type: EffectType.ApplyContinuousEffect,
                                        duration: { type: DurationType.UntilEndOfTurn },
                                        targetMapping: "ALL_CREATURES_WITHOUT_FLYING",
                                        restrictions: [{ type: 'CannotBlock' }]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };

