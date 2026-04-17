import { AbilityType, CardDefinition, DurationType, EffectType, TargetType, TriggerEvent } from '@shared/engine_types';
    export const InklingMascot: CardDefinition = {
    name: "Inkling Mascot",
    manaCost: "{W}{B}",
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
                    targetMapping: TargetType.Self
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
    