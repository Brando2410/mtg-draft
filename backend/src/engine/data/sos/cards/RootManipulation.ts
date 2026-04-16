import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const RootManipulation: CardDefinition = {
    name: "Root Manipulation",
    manaCost: "{3}{B}{G}",
    colors: [
        "B",
        "G"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Until end of turn, creatures you control get +2/+2 and gain menace and \"Whenever this creature attacks, you gain 1 life.\" (A creature with menace can't be blocked except by two or more creatures.)",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.AllCreaturesYouControl,
                    powerModifier: 2,
                    toughnessModifier: 2,
                    abilitiesToAdd: ["Menace"]
                },
                {
                    type: EffectType.AddTriggeredAbility,
                    eventMatch: TriggerEvent.Attack,
                    condition: 'EVENT_OBJECT_MATCHES:Creature,YouControl',
                    duration: { type: DurationType.UntilEndOfTurn },
                    effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }]
                }
            ]
        }
    ]
};
    