import { CardDefinition, AbilityType, CostType, TriggerEvent, TargetMapping, EffectType, DynamicAmount, TargetType, DurationType, Zone, ConditionType } from '@shared/engine_types';

export const MilaCraftyCompanion: CardDefinition = {
    name: "Mila, Crafty Companion",
    manaCost: "{1}{W}{W}",
    scryfall_id: "8e4e0f81-f92b-4a3a-bb29-adcc3de211b4",
    image_url: "https://cards.scryfall.io/normal/front/8/e/8e4e0f81-f92b-4a3a-bb29-adcc3de211b4.jpg?1748260747",
    colors: ["W"],
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
            colors: ["W"],
            supertypes: ["Legendary"],
            types: ["Creature"],
            subtypes: ["Fox"],
            power: "2",
            toughness: "3",
            oracleText: "Whenever an opponent attacks one or more planeswalkers you control, put a loyalty counter on each planeswalker you control.\nWhenever a permanent you control becomes the target of a spell or ability an opponent controls, you may draw a card.",
            abilities: [
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.AttackersDeclared,
                    condition: 'OpponentAttacksYourPlaneswalker',
                    effects: [{
                        type: EffectType.AddCounters,
                        counterType: 'loyalty',
                        amount: 1,
                        targetMapping: TargetMapping.AllPlaneswalkersYouControl
                    }]
                },
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.BecomeTarget,
                    condition: 'OpponentTargetsYourPermanent',
                    effects: [{
                        type: EffectType.Choice,
                        label: "Draw a card?",
                        targetMapping: TargetMapping.Controller,
                        choices: [
                            { label: "Yes", effects: [{ type: EffectType.DrawCards, amount: 1 }] },
                            { label: "No", effects: [] }
                        ]
                    }]
                }
            ]
        },
        {
            name: "Lukka, Wayward Bonder",
            manaCost: "{4}{R}{R}",
            colors: ["R"],
            supertypes: ["Legendary"],
            types: ["Planeswalker"],
            subtypes: ["Lukka"],
            loyalty: "5",
            oracleText: "+1: You may discard a card. If you do, draw a card. If a creature card was discarded this way, draw two cards instead.\n-2: Return target creature card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of your next upkeep.\n-7: You get an emblem with “Whenever a creature you control enters, it deals damage equal to its power to any target.”",
            abilities: [
                {
                    type: AbilityType.Activated,
                    costs: [{ type: 'Loyalty', value: 1 }],
                    effects: [{
                        type: EffectType.Choice,
                        label: "Discard a card?",
                        choices: [
                            {
                                label: "Discard",
                                effects: [
                                    { type: EffectType.DiscardCards, amount: 1 },
                                    {
                                        type: EffectType.ConditionalEffect,
                                        condition: 'DiscardedCreature',
                                        effects: [{ type: EffectType.DrawCards, amount: 2 }],
                                        onFailureEffects: [{ type: EffectType.DrawCards, amount: 1 }]
                                    }
                                ]
                            },
                            { label: "Decline", effects: [] }
                        ]
                    }]
                },
                {
                    type: AbilityType.Activated,
                    costs: [{ type: CostType.Loyalty, value: -2 }],
                    targetDefinition: {
                        type: TargetType.CardInGraveyard,
                        count: 1,
                        restrictions: ['creature']
                    },
                    effects: [
                        { type: EffectType.MoveToZone, zone: Zone.Battlefield, targetMapping: TargetMapping.Target1 },
                        {
                            type: EffectType.ApplyContinuousEffect,
                            duration: { type: DurationType.Permanent },
                            abilitiesToAdd: ['Haste'],
                            targetMapping: TargetMapping.Target1
                        },
                        {
                            type: EffectType.CreateDelayedTrigger,
                            eventMatch: TriggerEvent.Upkeep,
                            duration: { type: DurationType.UntilEndOfTurn },
                            condition: ConditionType.IsYourTurn,
                            effects: [{ type: EffectType.Exile, targetMapping: TargetMapping.Target1 }]
                        }
                    ]
                },
                {
                    type: AbilityType.Activated,
                    costs: [{ type: CostType.Loyalty, value: -7 }],
                    effects: [{
                        type: EffectType.CreateEmblem,
                        emblemBlueprint: {
                            name: "Lukka, Wayward Bonder Emblem",
                            oracleText: "Whenever a creature enters the battlefield under your control, it deals damage equal to its power to any target.",
                            abilities: [{
                                type: AbilityType.Triggered,
                                eventMatch: TriggerEvent.EnterBattlefield,
                                targetDefinition: { type: TargetType.AnyTarget, count: 1 },
                                effects: [{
                                    type: EffectType.DealDamage,
                                    amount: DynamicAmount.TriggerObjectPower,
                                    damageSourceMapping: TargetMapping.TriggerEventSource
                                }]
                            }]
                        }
                    }]
                }
            ]
        }
    ]
};
