import { CardDefinition, ConditionType, AbilityType, EffectType, TriggerEvent, TargetType, TargetMapping } from '@shared/engine_types';

export const StartledRelicSloth: CardDefinition = {
    "name": "Startled Relic Sloth",
    "manaCost": "{2}{R}{W}",
    "colors": [
        "R",
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Sloth",
        "Beast"
    ],
    "oracleText": "Trample, lifelink\nAt the beginning of combat on your turn, exile up to one target card from a graveyard.",
    "keywords": [
        "Trample",
        "Lifelink"
    ],
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.BeginningOfCombatStep,
            condition: ConditionType.IsYourTurn,
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 1,
                optional: true
            },
            effects: [
                {
                    type: EffectType.Exile,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    "power": "4",
    "toughness": "4"
};




