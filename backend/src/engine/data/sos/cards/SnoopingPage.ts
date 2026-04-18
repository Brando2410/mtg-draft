import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
export const SnoopingPage: CardDefinition = {
    name: "Snooping Page",
    manaCost: "{1}{W}{B}",
    colors: ["B", "W"],
    types: ["Creature"],
    subtypes: ["Human", "Cleric"],
    keywords: [],
    power: "2",
    toughness: "3",
    oracleText: "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, this creature can't be blocked this turn.\nWhenever this creature deals combat damage to a player, you draw a card and lose 1 life.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: 'REPARTEE_TRIGGER',
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    abilitiesToAdd: ["CannotBeBlocked"],
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Self
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.DamageDealtToPlayer,
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.LoseLife,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};

