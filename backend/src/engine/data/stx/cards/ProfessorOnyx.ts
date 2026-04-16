import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const ProfessorOnyx: CardDefinition = {
    name: "Professor Onyx",
    manaCost: "{4}{B}{B}",
    colors: ["B"],
    supertypes: ["Legendary"],
    types: ["Planeswalker"],
    subtypes: ["Onyx"],
    loyalty: "5",
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, each opponent loses 2 life and you gain 2 life.\n+1: You lose 1 life. Look at the top three cards of your library. Put one of them into your hand and the rest into your graveyard.\n−3: Each opponent sacrifices a creature with the greatest power among creatures that player controls.\n−8: Each opponent may discard a card. If they don't, they lose 3 life. Repeat this process six more times.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Magecraft,
            effects: [
                { type: EffectType.LoseLife, amount: 2, targetMapping: TargetMapping.EachOpponent },
                { type: EffectType.GainLife, amount: 2, targetMapping: TargetMapping.Controller }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Loyalty', value: '1' }],
            effects: [
                { type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.Controller },
                {
                    type: EffectType.LookAtTopAndPick,
                    fromTop: 3,
                    amount: 1,
                    zone: Zone.Hand,
                    remainderZone: Zone.Graveyard
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Loyalty', value: '-3' }],
            effects: [{
                type: EffectType.Sacrifice,
                targetMapping: TargetMapping.EachOpponent,
                restrictions: [{ type: 'GreatestPower' }]
            }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Loyalty', value: '-8' }],
            effects: Array(7).fill({
                type: EffectType.Choice,
                label: "Each opponent: Discard or lose 3 life?",
                targetMapping: TargetMapping.EachOpponent,
                choices: [
                    { label: "Discard", effects: [{ type: EffectType.DiscardCards, amount: 1, targetMapping: TargetMapping.Self }] },
                    { label: "Lose 3 Life", effects: [{ type: EffectType.LoseLife, amount: 3, targetMapping: TargetMapping.Self }] }
                ]
            })
        }
    ]
};


