import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
    export const HardenedAcademic: CardDefinition = {
    name: "Hardened Academic",
    manaCost: "{R}{W}",
    colors: [
        "R",
        "W"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Bird",
        "Cleric"
    ],
    keywords: ["Flying", "Haste"],
    oracleText: "Flying, haste\nDiscard a card: This creature gains lifelink until end of turn.\nWhenever one or more cards leave your graveyard, put a +1/+1 counter on target creature you control.",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Discard, amount: 1 }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    abilitiesToAdd: ["Lifelink"],
                    duration: 'UntilEndOfTurn',
                    targetMapping: TargetType.Self
                }
            ]
        },
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.LeaveGraveyard,
            targetDefinition: {
                type: DurationType.Permanent,
                count: 1,
                restrictions: ["Creature", "YouControl"]
            },
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: '+1/+1',
                    amount: 1,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    power: "2",
    toughness: "1"
};
    