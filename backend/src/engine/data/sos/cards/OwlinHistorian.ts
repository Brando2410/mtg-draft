import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
export const OwlinHistorian: CardDefinition = {
    name: "Owlin Historian",
    manaCost: "{2}{W}",
    scryfall_id: "5fe99be0-e1ec-485e-82f8-02eba7b82441",
    image_url: "https://cards.scryfall.io/normal/front/5/f/5fe99be0-e1ec-485e-82f8-02eba7b82441.jpg?1775937078",
    colors: [
        "W"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Bird",
        "Cleric"
    ],
    keywords: ["Flying"],
    power: "2",
    toughness: "3",
    oracleText: "Flying\nWhen this creature enters, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)\nWhenever one or more cards leave your graveyard, this creature gets +1/+1 until end of turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.Surveil,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.LeaveGraveyard,
            condition: ConditionType.PlayerIsController,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    toughnessModifier: 1,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ]
};
