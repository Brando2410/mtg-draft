import { TargetMapping, AbilityType, CardDefinition, DurationType, EffectType, TargetType, TriggerEvent } from '@shared/engine_types';
    export const InklingMascot: CardDefinition = {
    name: "Inkling Mascot",
    manaCost: "{W}{B}",
    scryfall_id: "6d4a2f39-0e1e-4076-815a-2676a09a1aab",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/6/d/6d4a2f39-0e1e-4076-815a-2676a09a1aab.jpg?1775938360",
    colors: [
        "B",
        "W"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Inkling",
        "Cat"
    ],
    keywords: [],
    oracleText: "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, this creature gains flying until end of turn. Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: 'REPARTEE_TRIGGER',
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    abilitiesToAdd: ['Flying'],
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Self
                },
                {
                    type: EffectType.Surveil,
                    amount: 1
                }
            ]
        }
    ],
    power: "2",
    toughness: "2"
};
    

