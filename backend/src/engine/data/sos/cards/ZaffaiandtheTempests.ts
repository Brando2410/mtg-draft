import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent, Zone, DurationType } from '@shared/engine_types';

export const ZaffaiandtheTempests: CardDefinition = {
    "name": "Zaffai and the Tempests",
    "manaCost": "{5}{U}{R}",
    "colors": [
        "U",
        "R"
    ],
    "types": [
        "Legendary",
        "Creature"
    ],
    "subtypes": [
        "Human",
        "Bard",
        "Sorcerer"
    ],
    "oracleText": "Once during each of your turns, you may cast an instant or sorcery spell from your hand without paying its mana cost.",
    "abilities": [
        {
            type: AbilityType.Static,
            activeZone: Zone.Battlefield,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    isFreeCast: true,
                    targetMapping: TargetMapping.Controller,
                    restrictions: ['Instant', 'Sorcery', 'FromHand'],
                    limitPerTurn: 1
                }
            ]
        }
    ],
    "power": "5",
    "toughness": "7"
};


