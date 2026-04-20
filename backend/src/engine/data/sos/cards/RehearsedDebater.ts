import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const RehearsedDebater: CardDefinition = {
    name: "Rehearsed Debater",
    manaCost: "{2}{W}",
    colors: [
        "W"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Djinn",
        "Bard"
    ],
    keywords: ["Vigilance"],
    oracleText: "Vigilance\nRepartee — Whenever you cast an instant or sorcery spell that targets a creature, this creature gets +1/+1 until end of turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: ConditionType.ReparteeTrigger,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.Self,
                    duration: { type: DurationType.UntilEndOfTurn },
                    powerModifier: 1,
                    toughnessModifier: 1
                }
            ]
        }
    ],
    power: "3",
    toughness: "3"
};


