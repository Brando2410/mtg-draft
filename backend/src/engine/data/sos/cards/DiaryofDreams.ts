import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const DiaryofDreams: CardDefinition = {
    "name": "Diary of Dreams",
    "manaCost": "{2}",
    "colors": [],
    "types": [
        "Artifact"
    ],
    "subtypes": [
        "Book"
    ],
    "oracleText": "Whenever you cast an instant or sorcery spell, put a page counter on this artifact.\n{5}, {T}: Draw a card. This ability costs {1} less to activate for each page counter on this artifact.",
    "abilities": [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            triggerCondition: 'PLAYER_IS_CONTROLLER', // Repartee-style or generic
            effects: [
                { 
                    type: EffectType.AddCounters, 
                    amount: 1, 
                    startingCounters: { type: 'page', amount: 1 }, 
                    targetMapping: TargetMapping.Self 
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { 
                    type: 'Mana', 
                    value: '{5}', 
                    costModifiers: [{ type: 'REDUCE_GENERIC_PER_COUNTER', counterType: 'page' }] 
                },
                { type: 'Tap' }
            ],
            effects: [
                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        }
    ]
};
