import { AbilityType, CardDefinition, ConditionType, EffectType, TriggerEvent } from '@shared/engine_types';
    export const AbstractPaintmage: CardDefinition = {
    name: "Abstract Paintmage",
    manaCost: "{U}{U/R}{R}",
    colors: [
        "R",
        "U"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Djinn",
        "Sorcerer"
    ],
    keywords: [],
    oracleText: "At the beginning of your first main phase, add {U}{R}. Spend this mana only to cast instant and sorcery spells.",
    power: "2",
    toughness: "2",

    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.PreCombatMainPhaseStart,
            condition: ConditionType.IsYourTurn,
            effects: [
                {
                    type: EffectType.AddMana,
                    value: '{U}{R}',
                    manaRestrictions: ['InstantOrSorcery']
                }
            ]
        }
    ],
};
    
