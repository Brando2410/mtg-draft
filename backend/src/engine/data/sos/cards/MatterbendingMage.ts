import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
export const MatterbendingMage: CardDefinition = {
    name: "Matterbending Mage",
    manaCost: "{2}{U}",
    colors: [
        "U"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Human",
        "Wizard"
    ],
    keywords: [],
    power: "2",
    toughness: "2",
    oracleText: "When this creature enters, return up to one other target creature to its owner's hand.\nWhenever you cast a spell with {X} in its mana cost, this creature can't be blocked this turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
                minCount: 0,
                restrictions: [
                    "other"
                ]
            },
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Hand,
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
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ]
};
