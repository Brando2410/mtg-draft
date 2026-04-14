import { CardDefinition, AbilityType, EffectType, TriggerEvent, TargetMapping } from '@shared/engine_types';

export const ImperiousInkmage: CardDefinition = {
    "name": "Imperious Inkmage",
    "manaCost": "{1}{W}{B}",
    "colors": [
        "B",
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Orc",
        "Warlock"
    ],
    "oracleText": "Vigilance\nWhen this creature enters, surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
    "keywords": ["Vigilance"],
    "abilities": [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.Scry, // engine uses Scry for both scry and surveil if zone is graveyard
                    amount: 2,
                    destination: 'graveyard' as any, // In this engine, Scry is modal or we have a Surveil type
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    "power": "3",
    "toughness": "3"
};
