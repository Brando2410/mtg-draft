import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const BasriKet: CardDefinition = {
    name: "Basri Ket",
    manaCost: "{1}{W}{W}",
    scryfall_id: "98c85699-2daf-4e87-a3be-465d02bd64bb",
    image_url: "https://cards.scryfall.io/normal/front/9/8/98c85699-2daf-4e87-a3be-465d02bd64bb.jpg?1594734775",
    oracleText: "+1: Put a +1/+1 counter on up to one target creature. It gains indestructible until end of turn.\n−2: Whenever one or more nontoken creatures attack this turn, create that many 1/1 white Soldier creature tokens that are tapped and attacking.\n−6: You get an emblem with \"At the beginning of combat on your turn, create a 1/1 white Soldier creature token, then put a +1/+1 counter on each creature you control.\"",
    colors: ["W"],
    supertypes: ["Legendary"],
    types: ["Planeswalker"],
    subtypes: ["Basri"],
    loyalty: "3",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '+1' }],
            targetDefinition: { type: TargetType.Creature, count: 1, minCount: 0, optional: true },
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 1,
                    counterType: '+1/+1',
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    abilitiesToAdd: ['Indestructible'],
                    layer: 6,
                    targetMapping: TargetMapping.Target1
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-2' }],
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                targetMapping: TargetMapping.Controller,
                delayedTriggers: [
                    {
                        eventMatch: TriggerEvent.AttackersDeclared,
                        // Only trigger if at least one nontoken creature attacked
                        condition: (state: any, event: any, trigger: any) => {
                            if (state.activePlayerId !== trigger.controllerId) return false;
                            const attackers = event.data.attackers || [];
                            return attackers.some((a: any) => {
                                const obj = state.battlefield.find((o: any) => o.id === a.attackerId);
                                return obj && !obj.isToken && obj.definition.types.some((t: string) => t.toLowerCase() === 'creature');
                            });
                        },
                        effects: [{
                            type: EffectType.CreateToken,
                            // "create THAT MANY" -> count of nontoken attackers
                            amount: (state: any, source: any, targets: any, context: any) => {
                                const event = context?.data?.eventData;
                                const attackers = event?.data?.attackers || [];
                                return attackers.filter((a: any) => {
                                    const obj = state.battlefield.find((o: any) => o.id === a.attackerId);
                                    return obj && !obj.isToken && obj.definition.types.some((t: string) => t.toLowerCase() === 'creature');
                                }).length;
                            },
                            tokenBlueprint: {
                                name: 'Soldier', power: '1', toughness: '1', colors: ['W'],
                                types: ['Creature'], subtypes: ['Soldier'],
                                image_url: 'https://cards.scryfall.io/large/front/b/7/b7b55dcf-ae63-4b84-8d39-80b5a6de3c1a.jpg'
                            },
                            isAttacking: true,
                            targetMapping: TargetMapping.Controller
                        }]
                    }
                ]
            }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-6' }],
            effects: [{
                type: EffectType.CreateEmblem,
                emblemBlueprint: {
                    name: "Basri Ket Emblem",
                    oracleText: "At the beginning of combat on your turn, create a 1/1 white Soldier creature token, then put a +1/+1 counter on each creature you control.",
                    abilities: [
                        {
                            eventMatch: TriggerEvent.BeginningOfCombatStep,
                            condition: (state: any, event: any, trigger: any) => {
                                return state.activePlayerId === trigger.controllerId;
                            },
                            effects: [
                                {
                                    type: EffectType.CreateToken,
                                    amount: 1,
                                    targetMapping: TargetMapping.Controller,
                                    tokenBlueprint: {
                                        name: 'Soldier', power: '1', toughness: '1', colors: ['W'],
                                        types: ['Creature'], subtypes: ['Soldier'],
                                        image_url: 'https://cards.scryfall.io/large/front/b/7/b7b55dcf-ae63-4b84-8d39-80b5a6de3c1a.jpg'
                                    }
                                },
                                {
                                    type: EffectType.AddCounters,
                                    amount: 1,
                                    counterType: '+1/+1',
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




