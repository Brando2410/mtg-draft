import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const RancorousArchaic: CardDefinition = {
    "name": "Rancorous Archaic",
    "manaCost": "{5}",
    "colors": [],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Avatar"
    ],
    "oracleText": "Trample, reach\nConverge — This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.",
    "keywords": [
        "Trample",
        "Reach"
    ],
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.EntersWithCounters,
                    counterType: '+1/+1',
                    amount: 'CONVERGE_AMOUNT'
                }
            ]
        }
    ],
    "power": "2",
    "toughness": "2"
};




