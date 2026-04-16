import { AbilityType, CardDefinition, CostType, DurationType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
    export const PracticedScrollsmith: CardDefinition = {
    name: "Practiced Scrollsmith",
    manaCost: "{R}{R/W}{W}",
    colors: [
        "R",
        "W"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Dwarf",
        "Cleric"
    ],
    keywords: [
        "First strike"
    ],
    oracleText: "First strike\nWhen this creature enters, exile target noncreature, nonland card from your graveyard. Until the end of your next turn, you may cast that card.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 1,
                restrictions: ['Noncreature', 'Nonland', Restriction.YouControl]
            },
            effects: [
                {
                    type: CostType.Exile,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    canPlayExiled: true,
                    duration: { type: DurationType.UntilEndOfYourNextTurn },
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    power: "3",
    toughness: "2"
};
    