import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping, TargetType, DurationType } from '@shared/engine_types';

export const MatterbendingMage: CardDefinition = {
    "name": "Matterbending Mage",
    "manaCost": "{2}{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Human",
        "Wizard"
    ],
    "oracleText": "When this creature enters, return up to one other target creature to its owner's hand.\nWhenever you cast a spell with {X} in its mana cost, this creature can't be blocked this turn.",
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: {
                type: TargetType.Permanent,
                count: [0, 1],
                restrictions: ["Creature", "OtherThanSource"]
            },
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: 'HAND',
                    targetMapping: TargetMapping.Target1
                }
            ]
        },
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastSpell,
            condition: (state: any, event: any, trigger: any) => {
                const card = event.data?.card || event.data?.object;
                return card && card.definition.manaCost?.includes('{X}') && event.playerId === trigger.controllerId;
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    abilitiesToAdd: ["Unblockable"],
                    duration: DurationType.UntilEndOfTurn,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    "power": "2",
    "toughness": "2"
};





