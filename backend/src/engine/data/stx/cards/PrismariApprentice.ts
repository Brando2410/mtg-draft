import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const PrismariApprentice: CardDefinition = {
    name: "Prismari Apprentice",
    manaCost: "{U}{R}",
    colors: ["U", "R"],
    types: ["Creature"],
    subtypes: ["Human", "Shaman"],
    power: "2",
    toughness: "2",
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, Prismari Apprentice can't be blocked this turn. Then if that spell has mana value 5 or greater, put a +1/+1 counter on Prismari Apprentice.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Magecraft,
            effects: [
                { type: EffectType.ApplyContinuousEffect, abilitiesToAdd: ['CannotBeBlocked'], duration: DurationType.UntilEndOfTurn, targetMapping: TargetMapping.Self },
                {
                    type: EffectType.Choice,
                    label: "Add +1/+1 counter if MV >= 5",
                    condition: "EVENT_MANA_VALUE_GE:5",
                    effects: [{ type: EffectType.AddCounters, counterType: '+1/+1', amount: 1, targetMapping: TargetMapping.Self }]
                }
            ]
        }
    ]
};


