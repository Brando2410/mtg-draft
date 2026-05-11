import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, DurationType } from '@shared/engine_types';

export const AkromasWill: CardDefinition = {
    name: "Akroma's Will",
    manaCost: "{3}{W}",
    oracleText: "Choose one. If you control a commander as you cast this spell, you may choose both.\n• Creatures you control gain flying, vigilance, and double strike until end of turn.\n• Creatures you control gain lifelink, indestructible, and protection from each color until end of turn.",
    colors: ["W"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            minChoices: 1,
            maxChoices: 1,
            chooseBothCondition: ConditionType.CONTROLS_COMMANDER,
            modes: [
                {
                    label: "Flying, vigilance, and double strike",
                    effects: [
                        {
                            type: EffectType.ApplyContinuousEffect,
                            targetMapping: TargetMapping.AllCreaturesYouControl,
                            keywordsToAdd: ["Flying", "Vigilance", "Double Strike"],
                            duration: { type: DurationType.UntilEndOfTurn }
                        }
                    ]
                },
                {
                    label: "Lifelink, indestructible, and protection",
                    effects: [
                        {
                            type: EffectType.ApplyContinuousEffect,
                            targetMapping: TargetMapping.AllCreaturesYouControl,
                            keywordsToAdd: [
                                "Lifelink",
                                "Indestructible"
                            ],
                            // Special handling for protection would ideally be keywords too
                            // but for now we stick to standard ones
                            duration: { type: DurationType.UntilEndOfTurn }
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "608cdbdb-6f7e-438a-bab0-0e7782435f0f",
    image_url: "https://cards.scryfall.io/normal/front/6/0/608cdbdb-6f7e-438a-bab0-0e7782435f0f.jpg?1698988079",
    rarity: "rare"
};
