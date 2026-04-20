import { AbilityType, CardDefinition, CostType, DurationType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

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
            costs: [{ type: CostType.Loyalty, value: 1 }],
            targetDefinition: { type: TargetType.Creature, count: 1, minCount: 0 },
            effects: [
                { type: EffectType.AddCounters, counterType: '+1/+1', amount: 1, targetMapping: TargetMapping.Target1 },
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    abilitiesToAdd: ['Indestructible'],
                    targetMapping: TargetMapping.Target1
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: -2 }],
            effects: [
                {
                    type: EffectType.ApplyDelayedTrigger,
                    eventMatch: TriggerEvent.Attack,
                    condition: 'NONTOKEN_CREATURES_ATTACK_UNDER_YOU',
                    effects: [
                        {
                            type: EffectType.CreateToken,
                            tokenBlueprint:
                            {
                                name: 'Soldier',
                                power: "1",
                                toughness: "1",
                                colors: ['W'],
                                types: ['Creature'],
                                subtypes: ['Soldier'],
                                image_url: 'https://cards.scryfall.io/large/front/2/4/248286ca-6814-432c-9037-7c93cc588725.jpg?1595010997'
                            },
                            amount: 'ATTACKING_NONTOKEN_CREATURES_COUNT',
                            tapped: true,
                            attacking: true,
                            targetMapping: TargetMapping.Controller
                        }
                    ],
                    duration: { type: DurationType.UntilEndOfTurn }
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: -6 }],
            effects: [
                {
                    type: EffectType.CreateEmblem,
                    emblemBlueprint: {
                        name: 'Basri Ket Emblem',
                        image_url: 'https://cards.scryfall.io/large/front/1/7/17d4710a-3cc1-470a-8643-fc03632f0535.jpg?1594733789',
                        abilities: [
                            {
                                type: AbilityType.Triggered,
                                eventMatch: TriggerEvent.BeginningOfCombatStep,
                                condition: 'OUR_TURN',
                                effects: [
                                    {
                                        type: EffectType.CreateToken,
                                        tokenBlueprint: {
                                            name: 'Soldier',
                                            power: "1",
                                            toughness: "1",
                                            colors: ['W'],
                                            types: ['Creature'],
                                            subtypes: ['Soldier'],
                                            image_url: 'https://cards.scryfall.io/large/front/2/4/248286ca-6814-432c-9037-7c93cc588725.jpg?1595010997'
                                        },
                                        targetMapping: TargetMapping.Controller
                                    },
                                    {
                                        type: EffectType.AddCounters,
                                        counterType: '+1/+1',
                                        amount: 1,
                                        targetMapping: TargetMapping.AllCreaturesYouControl
                                    }
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    ]
};
