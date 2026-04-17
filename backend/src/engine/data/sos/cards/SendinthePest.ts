import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const SendinthePest: CardDefinition = {
    name: "Send in the Pest",
    manaCost: "{1}{B}",
    colors: [
        "B"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Each opponent discards a card. You create a 1/1 black and green Pest creature token with \"Whenever this token attacks, you gain 1 life.\"",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.DiscardCards,
                    amount: 1,
                    targetMapping: TargetMapping.EachOpponent
                },
                {
                    type: EffectType.CreateToken,
                    amount: 1,
                    tokenBlueprint: {
                        name: "Pest",
                        types: ["Creature"],
                        subtypes: ["Pest"],
                        colors: ["B", "G"],
                        power: "1",
                        toughness: "1",
                        oracleText: "Whenever this token attacks, you gain 1 life.",
                        image_url: "https://cards.scryfall.io/png/front/d/0/d0ddbe3e-4a66-494d-9304-7471232549bf.png?1682693901",
                        abilities: [
                            {
                                type: AbilityType.Triggered,
                                eventMatch: TriggerEvent.Attack,
                                condition: ConditionType.SelfAttacks,
                                effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }]
                            }
                        ]
                    },
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
