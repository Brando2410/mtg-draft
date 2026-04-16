import {
    CardDefinition,
    Zone,
    AbilityType,
    TriggerEvent,
    TargetMapping,
    EffectType,
    DynamicAmount,
    TargetType,
    Restriction,
    ConditionType,
    DurationType
} from '@shared/engine_types';

export const MilaCraftyCompanion: CardDefinition = {
    name: "Mila, Crafty Companion",
    manaCost: "{1}{W}{W}",
    colors: ["White"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Fox"],
    power: "2",
    toughness: "3",
    oracleText: "Whenever an opponent attacks one or more planeswalkers you control, put a loyalty counter on each planeswalker you control.\nWhenever a permanent you control becomes the target of a spell or ability an opponent controls, you may draw a card.",
    faces: [
        {
            name: "Mila, Crafty Companion",
            manaCost: "{1}{W}{W}",
            colors: ["White"],
            supertypes: ["Legendary"],
            types: ["Creature"],
            subtypes: ["Fox"],
            power: "2",
            toughness: "3",
            oracleText: "Whenever an opponent attacks one or more planeswalkers you control, put a loyalty counter on each planeswalker you control.\nWhenever a permanent you control becomes the target of a spell or ability an opponent controls, you may draw a card.",
            abilities: [
                {
                    id: "mila_attack_trigger",
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.AttackersDeclared,
                    condition: "OPPONENT_ATTACKS_YOUR_PLANESWALKER",
                    oracleText: "Whenever an opponent attacks one or more planeswalkers you control, put a loyalty counter on each planeswalker you control.",
                    effects: [
                        {
                            type: EffectType.AddCounters,
                            counterType: "loyalty",
                            amount: 1,
                            targetMapping: "ALL_PLANESWALKERS_YOU_CONTROL"
                        }
                    ]
                },
                {
                    id: "mila_target_trigger",
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.BecomeTarget,
                    condition: "OPPONENT_TARGETS_YOUR_PERMANENT",
                    oracleText: "Whenever a permanent you control becomes the target of a spell or ability an opponent controls, you may draw a card.",
                    effects: [
                        {
                            type: EffectType.Choice,
                            label: "Draw a card?",
                            targetMapping: TargetMapping.Controller,
                            choices: [
                                { label: "Yes", effects: [{ type: EffectType.DrawCards, amount: 1 }] },
                                { label: "No", effects: [] }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            name: "Lukka, Wayward Bonder",
            manaCost: "{4}{R}{R}",
            colors: ["Red"],
            supertypes: ["Legendary"],
            types: ["Planeswalker"],
            subtypes: ["Lukka"],
            loyalty: "5",
            oracleText: "+1: You may discard a card. If you do, draw a card. If a creature card was discarded this way, draw two cards instead.\n-2: Return target creature card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of your next upkeep.\n-7: You get an emblem with “Whenever a creature you control enters, it deals damage equal to its power to any target.”",
            abilities: [
                {
                    id: "lukka_plus1",
                    type: AbilityType.Activated,
                    costs: [{ type: "Loyalty", value: 1 }],
                    oracleText: "+1: You may discard a card. If you do, draw a card. If a creature card was discarded this way, draw two cards instead.",
                    effects: [
                        {
                            type: EffectType.Choice,
                            label: "Discard a card?",
                            choices: [
                                {
                                    label: "Discard",
                                    effects: [
                                        { type: EffectType.DiscardCards, amount: 1 },
                                        {
                                            type: EffectType.ConditionalEffect,
                                            condition: "LAST_DISCARDED_HAS_TYPE_CREATURE",
                                            effects: [{ type: EffectType.DrawCards, amount: 2 }],
                                            onFailureEffects: [{ type: EffectType.DrawCards, amount: 1 }]
                                        }
                                    ]
                                },
                                {
                                    label: "Decline",
                                    effects: []
                                }
                            ]
                        }
                    ]
                },
                {
                    id: "lukka_minus2",
                    type: AbilityType.Activated,
                    costs: [{ type: "Loyalty", value: -2 }],
                    targetDefinition: {
                        type: TargetType.CardInGraveyard,
                        zone: Zone.Graveyard,
                        count: 1,
                        restrictions: [Restriction.Creature]
                    },
                    oracleText: "-2: Return target creature card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of your next upkeep.",
                    effects: [
                        {
                            type: EffectType.PutOnBattlefield,
                            targetMapping: TargetMapping.Target1
                        },
                        {
                            type: EffectType.ApplyContinuousEffect,
                            duration: DurationType.Permanent,
                            abilitiesToAdd: ["Haste"],
                            targetMapping: TargetMapping.Target1
                        },
                        {
                            type: EffectType.CreateDelayedTrigger,
                            eventMatch: TriggerEvent.Upkeep,
                            condition: "IS_YOUR_TURN",
                            oneShot: true,
                            effects: [{
                                type: EffectType.Exile,
                                targetMapping: TargetMapping.Target1
                            }]
                        }
                    ]
                },
                {
                    id: "lukka_minus7",
                    type: AbilityType.Activated,
                    costs: [{ type: 'Loyalty', amount: -7 }],
                    oracleText: "-7: You get an emblem with “Whenever a creature you control enters, it deals damage equal to its power to any target.”",
                    effects: [
                        {
                            type: EffectType.CreateEmblem,
                            emblemBlueprint: {
                                name: "Lukka, Wayward Bonder Emblem",
                                oracleText: "Whenever a creature enters the battlefield under your control, it deals damage equal to its power to any target.",
                                abilities: [
                                    {
                                        type: AbilityType.Triggered,
                                        eventMatch: TriggerEvent.EnterBattlefieldOther,
                                        condition: ConditionType.OwnCreatureEnters,
                                        targetDefinition: {
                                            type: TargetType.AnyTarget,
                                            count: 1
                                        },
                                        effects: [
                                            {
                                                type: EffectType.DealDamage,
                                                amount: 'TARGET_1_POWER',
                                                damageSourceMapping: 'TRIGGER_EVENT_SOURCE'
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                }
            ]
        }
    ]
};
