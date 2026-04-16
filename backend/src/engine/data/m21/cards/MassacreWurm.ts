import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const MassacreWurm: CardDefinition = {
    name: "Massacre Wurm",
    manaCost: "{3}{B}{B}{B}",
    oracleText: "When Massacre Wurm enters, creatures your opponents control get -2/-2 until end of turn.\nWhenever a creature an opponent controls dies, that player loses 2 life.",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Phyrexian", "Wurm"],
    power: "6",
    toughness: "5",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                powerModifier: -2,
                toughnessModifier: -2,
                targetMapping: TargetMapping.AllMatchingPermanents,
                restrictions: ['Creature', 'OpponentControl']
            }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.DeathOther,
            condition: 'EVENT_OBJECT_MATCHES:creature,opponentcontrol',
            effects: [{
                type: EffectType.LoseLife,
                amount: 2,
                targetMapping: 'EVENT_OBJECT_CONTROLLER' as any
            }]
        }
    ]
};




