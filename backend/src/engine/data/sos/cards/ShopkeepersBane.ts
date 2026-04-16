import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const ShopkeepersBane: CardDefinition = {
    "name": "Shopkeeper's Bane",
    "manaCost": "{2}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Badger",
        "Pest"
    ],
    "oracleText": "Trample\nWhenever this creature attacks, you gain 2 life.",
    "keywords": ["Trample"],
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
            effects: [
                { type: EffectType.GainLife, amount: 2, targetMapping: TargetMapping.Controller }
            ]
        }
    ],
    "power": "4",
    "toughness": "2"
};




