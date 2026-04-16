import { AbilityType, CardDefinition, DurationType, EffectType, TargetType, TriggerEvent } from '@shared/engine_types';
    export const SpectacularSkywhale: CardDefinition = {
    name: "Spectacular Skywhale",
    manaCost: "{2}{U}{R}",
    colors: [
        "R",
        "U"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Elemental",
        "Whale"
    ],
    keywords: ["Flying"],
    oracleText: "Flying\nOpus — Whenever you cast an instant or sorcery spell, this creature gets +3/+0 until end of turn. If five or more mana was spent to cast that spell, put three +1/+1 counters on this creature instead.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastSpell,
            condition: 'PLAYER_IS_CONTROLLER && (EVENT_OBJECT_MATCHES:Instant || EVENT_OBJECT_MATCHES:Sorcery)',
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 3,
                    counterType: '+1/+1',
                    condition: 'SPENT_MANA_GE:5',
                    targetMapping: TargetType.Self
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    condition: 'SPENT_MANA_LT:5',
                    duration: { type: DurationType.UntilEndOfTurn },
                    powerModifier: 3,
                    toughnessModifier: 0,
                    targetMapping: TargetType.Self
                }
            ]
        }
    ],
    power: "1",
    toughness: "4"
};
    