import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const SunderingArchaic: CardDefinition = {
    "name": "Sundering Archaic",
    "manaCost": "{6}",
    "colors": [],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Avatar"
    ],
    "oracleText": "Converge — When this creature enters, exile target nonland permanent an opponent controls with mana value less than or equal to the number of colors of mana spent to cast this creature.\n{2}: Put target card from a graveyard on the bottom of its owner's library.",
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: {
                count: 1,
                restrictions: [
                    'Nonland',
                    'OpponentControl',
                    { type: 'ManaValue', comparison: 'LessOrEqual', value: 'CONVERGE_AMOUNT' }
                ]
            },
            effects: [
                {
                    type: EffectType.Exile,
                    targetMapping: TargetMapping.Target1
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Mana', value: '{2}' }],
            targetDefinition: {
                count: 1,
                type: TargetType.CardInGraveyard
            },
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Library,
                    position: 'bottom',
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    "power": "3",
    "toughness": "3"
};





