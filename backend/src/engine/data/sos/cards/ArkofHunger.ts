import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const ArkofHunger: CardDefinition = {
    name: "Ark of Hunger",
    manaCost: "{2}{R}{W}",
    scryfall_id: "79d01c19-162b-4a12-9e27-18366d95eaa0",
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/7/9/79d01c19-162b-4a12-9e27-18366d95eaa0.jpg?1775938187",
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
            costs: [{ type: CostType.Tap, targetMapping: TargetMapping.Self }],
            effects: [
                { type: EffectType.Mill, amount: 1 },
                { type: EffectType.AllowPlayMilledCard, duration: { type: DurationType.UntilEndOfTurn } }
            ]
        }
    ]
};
    
