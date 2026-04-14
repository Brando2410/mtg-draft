import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent, ConditionType } from '@shared/engine_types';

export const AbstractPaintmage: CardDefinition = {
    "name": "Abstract Paintmage",
    "manaCost": "{U}{U/R}{R}",
    "colors": [
        "R",
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Djinn",
        "Sorcerer"
    ],
    "oracleText": "At the beginning of your first main phase, add {U}{R}. Spend this mana only to cast instant and sorcery spells.",
    "abilities": [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.PreCombatMainPhaseStart,
            condition: ConditionType.IsYourTurn,
            effects: [
                { 
                    type: 'AddMana', 
                    value: '{U}{R}', 
                    manaRestrictions: ['Instant', 'Sorcery'] 
                }
            ]
        }
    ],
    "power": "2",
    "toughness": "2"
};
