import { CardDefinition } from '@shared/engine_types';

export const AkromasWill: CardDefinition = {
    name: "Akroma's Will",
    manaCost: "{3}{W}",
    oracleText: "Choose one. If you control a commander as you cast this spell, you may choose both.\n• Creatures you control gain flying, vigilance, and double strike until end of turn.\n• Creatures you control gain lifelink, indestructible, and protection from each color until end of turn.",
    colors: ["W"],
    types: ["Instant"],
    abilities: [
        /*    {
                type: AbilityType.Spell,
                chooseBothCondition: ConditionType.CONTROLS_COMMANDER,
                modes: [
                    {
                        label: "Flying, vigilance, and double strike",
                        effects: [
                            {
                                type: EffectType.ApplyContinuousEffect,
                                targetMapping: TargetMapping.ControlledCreatures,
                                abilitiesToAdd: ["Flying", "Vigilance", "Double strike"],
                                duration: { type: DurationType.UntilEndOfTurn }
                            }
                        ]
                    },
                    {
                        label: "Lifelink, indestructible, and protection",
                        effects: [
                            {
                                type: EffectType.ApplyContinuousEffect,
                                targetMapping: TargetMapping.ControlledCreatures,
                                abilitiesToAdd: [
                                    "Lifelink", 
                                    "Indestructible",
                                    "Protection from white",
                                    "Protection from blue",
                                    "Protection from black",
                                    "Protection from red",
                                    "Protection from green"
                                ],
                                duration: { type: DurationType.UntilEndOfTurn }
                            }
                        ]
                    }
                ]
            }*/
    ]
};
