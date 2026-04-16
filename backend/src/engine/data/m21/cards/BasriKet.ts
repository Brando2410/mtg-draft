import { AbilityType, ZoneRequirement, EffectType, TargetMapping, TargetType, DurationType, CardDefinition } from '@shared/engine_types';

export const BasriKet: CardDefinition = {

    name: "Basri Ket",
    manaCost: "{1}{W}{W}",
    oracleText: "+1: Put a +1/+1 counter on up to one target creature. It gains indestructible until end of turn.\n−2: Whenever one or more nontoken creatures attack this turn, create that many 1/1 white Soldier creature tokens that are tapped and attacking.\n−6: You get an emblem with \"At the beginning of combat on your turn, create a 1/1 white Soldier creature token, then put a +1/+1 counter on each creature you control.\"",
    colors: ["W"],
    supertypes: ["Legendary"],
    types: ["Planeswalker"],
    subtypes: ["Basri"],
    keywords: [],
    loyalty: "3",
    abilities: [
        {
            id: "basri_ket_plus_1",
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Loyalty', value: '+1' }],
            targetDefinition: { type: TargetType.Creature, count: 1, minCount: 0, optional: true, restrictions: [] },
            effects: [
                { type: EffectType.AddCounters, amount: 1, counterType: 'p1p1', targetMapping: TargetMapping.Target1 },
                { type: EffectType.ApplyContinuousEffect, duration: DurationType.UntilEndOfTurn, abilitiesToAdd: ['Indestructible'], layer: 6, targetMapping: TargetMapping.Target1 }
            ]
        },
        {
            id: "basri_ket_minus_2",
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Loyalty', value: '-2' }],
            effects: [{
                type: EffectType.CreateToken,
                tokenBlueprint: {
                    name: 'Soldier', power: '1', toughness: '1', colors: ['W'],
                    types: ['Creature'], subtypes: ['Soldier'], keywords: [],
                    image_url: 'https://cards.scryfall.io/large/front/b/7/b7b55dcf-ae63-4b84-8d39-80b5a6de3c1a.jpg'
                },
                amount: 1,
                isAttacking: true,
                targetMapping: TargetMapping.Controller
            }]
        },
        {
            id: "basri_ket_minus_6",
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Loyalty', value: '-6' }],
            effects: [{
                type: EffectType.CreateEmblem,
                emblemBlueprint: {
                    name: "Basri Ket Emblem",
                    oracleText: "At the beginning of combat on your turn, create a 1/1 white Soldier creature token, then put a +1/+1 counter on each creature you control.",
                    abilities: [
                        {
                            eventMatch: 'ON_BEGINNING_OF_COMBAT_STEP',
                            // Condition: only trigger on the emblem controller's turn
                            condition: (state: any, event: any, trigger: any) => {
                                return state.activePlayerId === trigger.controllerId;
                            },
                            effects: [
                                // 1. Create a 1/1 Soldier token for the controller
                                {
                                    type: EffectType.CreateToken,
                                    amount: 1,
                                    targetMapping: TargetMapping.Controller,
                                    tokenBlueprint: {
                                        name: 'Soldier', power: '1', toughness: '1', colors: ['W'],
                                        types: ['Creature'], subtypes: ['Soldier'], keywords: [],
                                        image_url: 'https://cards.scryfall.io/large/front/b/7/b7b55dcf-ae63-4b84-8d39-80b5a6de3c1a.jpg'
                                    }
                                },
                                // 2. Put a +1/+1 counter on each creature the controller controls
                                {
                                    type: EffectType.AddCounters,
                                    amount: 1,
                                    counterType: 'p1p1',
                                    targetMapping: TargetMapping.AllCreaturesYouControl
                                }
                            ]
                        }
                    ]
                }
            }]
        }
    ]

};


