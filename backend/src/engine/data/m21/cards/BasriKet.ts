import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const BasriKet: Record<string, ImplementableCard> = {
    "Basri Ket": {
        name: "Basri Ket",
        manaCost: "{1}{W}{W}",
        oracleText: "+1: Put a +1/+1 counter on up to one target creature. It gains indestructible until end of turn.\n−2: Whenever one or more nontoken creatures attack this turn, create that many 1/1 white Soldier creature tokens that are tapped and attacking.\n−6: You get an emblem with \"At the beginning of combat on your turn, create a 1/1 white Soldier creature token, then put a +1/+1 counter on each creature you control.\"",
        colors: ["white"],
        supertypes: ["Legendary"],
        types: ["Planeswalker"],
        subtypes: ["Basri"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        loyalty: "3",
        abilities: [
            {
                id: "basri_ket_plus_1",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '+1' }],
                targetDefinition: { type: 'Permanent', count: 1, optional: true, restrictions: ['Creature'] },
                effects: [
                    { type: 'AddCounters', amount: 1, value: '+1/+1', targetMapping: 'TARGET_1' },
                    { type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Indestructible'], layer: 6, targetMapping: 'TARGET_1' }
                ]
            },
            {
                id: "basri_ket_minus_2",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '-2' }],
                effects: [{
                    type: 'CreateToken',
                    tokenBlueprint: {
                        name: 'Soldier', power: '1', toughness: '1', colors: ['W'],
                        types: ['Creature'], subtypes: ['Soldier'], keywords: [],
                        image_url: 'https://cards.scryfall.io/large/front/b/7/b7b55dcf-ae63-4b84-8d39-80b5a6de3c1a.jpg'
                    },
                    amount: 1,
                    isAttacking: true,
                    targetMapping: 'CONTROLLER'
                }]
            },
            {
                id: "basri_ket_minus_6",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '-6' }],
                effects: [{
                    type: 'CreateEmblem',
                    emblemBlueprint: {
                        name: "Basri Ket Emblem",
                        oracleText: "At the beginning of combat on your turn, create a 1/1 white Soldier creature token, then put a +1/+1 counter on each creature you control.",
                        abilities: [
                            {
                                triggerEvent: 'ON_BEGINNING_OF_COMBAT_STEP',
                                // Condition: only trigger on the emblem controller's turn
                                triggerCondition: (state: any, event: any, trigger: any) => {
                                    return state.activePlayerId === trigger.controllerId;
                                },
                                effects: [
                                    // 1. Create a 1/1 Soldier token for the controller
                                    {
                                        type: 'CreateToken',
                                        amount: 1,
                                        targetMapping: 'CONTROLLER',
                                        tokenBlueprint: {
                                            name: 'Soldier', power: '1', toughness: '1', colors: ['W'],
                                            types: ['Creature'], subtypes: ['Soldier'], keywords: [],
                                            image_url: 'https://cards.scryfall.io/large/front/b/7/b7b55dcf-ae63-4b84-8d39-80b5a6de3c1a.jpg'
                                        }
                                    },
                                    // 2. Put a +1/+1 counter on each creature the controller controls
                                    {
                                        type: 'AddCounters',
                                        amount: 1,
                                        value: '+1/+1',
                                        targetMapping: 'ALL_CREATURES_YOU_CONTROL'
                                    }
                                ]
                            }
                        ]
                    }
                }]
            }
        ]
    }
};
