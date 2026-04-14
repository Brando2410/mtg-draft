import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent, DurationType } from '@shared/engine_types';

export const BlechLoafingPest: CardDefinition = {
    "name": "Blech, Loafing Pest",
    "manaCost": "{1}{B}{G}",
    "colors": [
        "B",
        "G"
    ],
    "types": [
        "Legendary",
        "Creature"
    ],
    "subtypes": [
        "Pest"
    ],
    "oracleText": "Whenever you gain life, put a +1/+1 counter on each Pest, Bat, Insect, Snake, and Spider you control.",
    "abilities": [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.LifeGain,
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 1,
                    value: '+1/+1',
                    targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                    restrictions: [
                        { type: 'Subtype', subtypes: ['Pest', 'Bat', 'Insect', 'Snake', 'Spider'] }
                    ]
                }
            ]
        }
    ],
    "power": "3",
    "toughness": "4"
};
