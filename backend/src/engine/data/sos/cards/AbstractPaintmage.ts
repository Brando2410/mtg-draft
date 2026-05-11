import { AbilityType, CardDefinition, ConditionType, EffectType, Restriction, TriggerEvent } from '@shared/engine_types';
export const AbstractPaintmage: CardDefinition = {
    name: "Abstract Paintmage",
    manaCost: "{U}{U/R}{R}",
    colors: ["R", "U"],
    types: ["Creature"],
    subtypes: ["Djinn", "Sorcerer"],
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
                    manaType: '{U}{R}',
                    manaRestrictions: [Restriction.InstantOrSorcery]
                }
            ]
        }
    ],
    scryfall_id: "ea008094-d995-4740-9b39-c61049356c55",
    image_url: "https://cards.scryfall.io/normal/front/e/a/ea008094-d995-4740-9b39-c61049356c55.jpg?1775938173",
    rarity: "uncommon"
};

