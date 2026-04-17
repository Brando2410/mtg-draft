import { AbilityType, CardDefinition, CostType, DurationType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
export const PracticedScrollsmith: CardDefinition = {
    name: "Practiced Scrollsmith",
    manaCost: "{R}{R/W}{W}",
    scryfall_id: "40075e3f-58b3-47fd-8fbe-4b301e9ce7a1",
    image_url: "https://cards.scryfall.io/normal/front/4/0/40075e3f-58b3-47fd-8fbe-4b301e9ce7a1.jpg?1775938459",
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
                restrictions: [
                    "noncreature",
                    "nonland",
                    Restriction.YouControl
                ]
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
