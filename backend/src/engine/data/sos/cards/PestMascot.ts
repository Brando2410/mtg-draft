import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const PestMascot: CardDefinition = {
    "name": "Pest Mascot",
    "manaCost": "{1}{B}{G}",
    "colors": [
        "B",
        "G"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Pest",
        "Ape"
    ],
    "oracleText": "Trample\nWhenever you gain life, put a +1/+1 counter on this creature.",
    "keywords": ["Trample"],
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.LifeGain,
            condition: ConditionType.PlayerIsController,
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: 'p1p1',
                    amount: 1,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    "power": "2",
    "toughness": "3"
};


