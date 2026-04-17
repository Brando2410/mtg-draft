import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
export const HardenedAcademic: CardDefinition = {
    name: "Hardened Academic",
    manaCost: "{R}{W}",
    scryfall_id: "06c9e8a7-2840-4cff-90af-c6636e598f78",
    image_url: "https://cards.scryfall.io/normal/front/0/6/06c9e8a7-2840-4cff-90af-c6636e598f78.jpg?1775938346",
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
    power: "2",
    toughness: "1",
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
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Self
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.LeaveGraveyard,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
                restrictions: [
                    "youcontrol"
                ]
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
    ]
};
