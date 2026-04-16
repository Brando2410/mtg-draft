import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
    export const ArkofHunger: CardDefinition = {
    name: "Ark of Hunger",
    manaCost: "{2}{R}{W}",
    colors: [
        "R",
        "W"
    ],
    types: [
        "Artifact"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Whenever one or more cards leave your graveyard, this artifact deals 1 damage to each opponent and you gain 1 life.\n{T}: Mill a card. You may play that card this turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.LeaveGraveyard,
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 1,
                    targetMapping: TargetMapping.EachOpponent
                },
                {
                    type: EffectType.GainLife,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap, targetMapping: TargetType.Self }],
            effects: [
                { type: EffectType.Mill, amount: 1 },
                { type: EffectType.AllowPlayMilledCard, duration: { type: DurationType.UntilEndOfTurn } }
            ]
        }
    ]
};
    