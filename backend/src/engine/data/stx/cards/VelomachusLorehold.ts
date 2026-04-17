import { AbilityType, CardDefinition, ConditionType, EffectType, TriggerEvent, Zone } from '@shared/engine_types';

export const VelomachusLorehold: CardDefinition = {
    name: "Velomachus Lorehold",
    manaCost: "{5}{R}{W}",
    colors: ["R", "W"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Elder", "Dragon"],
    power: "5",
    toughness: "5",
    keywords: ["Flying", "Vigilance", "Haste"],
    oracleText: "Flying, vigilance, haste. Whenever Velomachus Lorehold attacks, look at the top seven cards of your library. You may cast an instant or sorcery spell with mana value less than or equal to Velomachus Lorehold's power from among them without paying its mana cost. Put the rest on the bottom of your library in a random order.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            condition: ConditionType.SelfAttacks,
            effects: [{
                type: EffectType.SearchLibrary,
                fromTop: 7,
                optional: true,
                restrictions: [
                    { type: 'Type', value: 'InstantOrSorcery' },
                    { type: 'ManaValue', comparison: 'LessOrEqual', value: 'SOURCE_POWER' }
                ],
                zone: Zone.Stack,
                isFreeCast: true,
                remainderZone: Zone.Library,
                remainderPosition: 'bottom',
                shuffleRemainder: true
            }]
        }
    ]
};
