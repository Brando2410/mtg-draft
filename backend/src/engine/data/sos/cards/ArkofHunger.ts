import { CardDefinition, AbilityType, EffectType, TargetMapping, DurationType } from '@shared/engine_types';

export const ArkofHunger: CardDefinition = {
    "name": "Ark of Hunger",
    "manaCost": "{2}{R}{W}",
    "colors": [
        "R",
        "W"
    ],
    "types": [
        "Artifact"
    ],
    "subtypes": [],
    "oracleText": "Whenever one or more cards leave your graveyard, this artifact deals 1 damage to each opponent and you gain 1 life.\n{T}: Mill a card. You may play that card this turn.",
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: 'ON_LEAVE_GRAVEYARD',
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
            costs: [{ type: 'Tap', targetMapping: 'SELF' }],
            effects: [
                { type: 'Mill', amount: 1 },
                { type: 'AllowPlayMilledCard', duration: DurationType.UntilEndOfTurn }
            ]
        }
    ]
};



