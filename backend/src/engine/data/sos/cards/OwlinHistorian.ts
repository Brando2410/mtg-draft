import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping } from '@shared/engine_types';

export const OwlinHistorian: CardDefinition = {
    "name": "Owlin Historian",
    "manaCost": "{2}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Bird",
        "Cleric"
    ],
    "keywords": ["Flying"],
    "oracleText": "Flying\nWhen this creature enters, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)\nWhenever one or more cards leave your graveyard, this creature gets +1/+1 until end of turn.",
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.Surveil,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.LeaveGraveyard,
            condition: 'PLAYER_IS_CONTROLLER',
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    toughnessModifier: 1,
                    duration: 'UntilEndOfTurn',
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    "power": "2",
    "toughness": "3"
};

