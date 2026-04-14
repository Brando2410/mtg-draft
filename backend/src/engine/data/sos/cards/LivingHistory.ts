import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const LivingHistory: CardDefinition = {
    "name": "Living History",
    "manaCost": "{1}{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Enchantment"
    ],
    "subtypes": [],
    "oracleText": "When this enchantment enters, create a 2/2 red and white Spirit creature token.\nWhenever you attack, if a card left your graveyard this turn, target attacking creature gets +2/+0 until end of turn.",
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: "Spirit",
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.AttackersDeclared,
            condition: 'CARDS_LEFT_YOUR_GRAVEYARD_THIS_TURN',
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: ["Creature", "Attacking"]
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 2,
                    toughnessModifier: 0,
                    duration: "UNTIL_END_OF_TURN",
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};





