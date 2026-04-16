import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const PestbroodSloth: CardDefinition = {
    "name": "Pestbrood Sloth",
    "manaCost": "{3}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Plant",
        "Sloth"
    ],
    "oracleText": "Reach\nWhen this creature dies, create two 1/1 black and green Pest creature tokens with \"Whenever this token attacks, you gain 1 life.\"",
    "keywords": ["Reach"],
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Death,
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 2,
                    tokenBlueprint: {
                        name: "Pest",
                        colors: ["B", "G"],
                        types: ["Creature"],
                        subtypes: ["Pest"],
                        power: "1",
                        toughness: "1",
                        oracleText: "Whenever this token attacks, you gain 1 life.",
                        image_url: "https://cards.scryfall.io/png/front/d/0/d0ddbe3e-4a66-494d-9304-7471232549bf.png?1682693901",
                        abilities: [
                            {
                                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
                                condition: 'EVENT_SOURCE_IS_SELF',
                                effects: [
                                    {
                                        type: EffectType.GainLife,
                                        amount: 1,
                                        targetMapping: TargetMapping.Controller
                                    }
                                ]
                            }
                        ]
                    },
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    "power": "4",
    "toughness": "4"
};




