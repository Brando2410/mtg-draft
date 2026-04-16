import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const GarrukUnleashed: CardDefinition = {
    name: "Garruk, Unleashed",
    manaCost: "{2}{G}{G}",
    oracleText: "+1: Up to one target creature gets +3/+3 and gains trample until end of turn.\n−2: Create a 3/3 green Beast creature token. Then if an opponent controls more creatures than you, put a loyalty counter on Garruk.\n−7: You get an emblem with \"At the beginning of your end step, you may search your library for a creature card, put it onto the battlefield, then shuffle.\"",
    colors: ["G"],
    supertypes: ["Legendary"],
    types: ["Planeswalker"],
    subtypes: ["Garruk"],
    loyalty: "4",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '+1' }],
            targetDefinition: { type: TargetType.Creature, count: 1, minCount: 0, optional: true },
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                powerModifier: 3,
                toughnessModifier: 3,
                abilitiesToAdd: ['Trample'],
                layer: 7,
                targetMapping: TargetMapping.Target1
            }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-2' }],
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Beast', power: '3', toughness: '3', colors: ['G'],
                        types: ['Creature'], subtypes: ['Beast'],
                        image_url: 'https://cards.scryfall.io/large/front/d/0/d06fcc31-039c-4389-9b93-b6764d265002.jpg'
                    },
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.AddCounters,
                    counterType: 'loyalty',
                    amount: 1,
                    targetMapping: TargetMapping.Self,
                    condition: (state: any, source: any) => {
                        const controllerId = source.controllerId;
                        const opponentId = Object.keys(state.players).find(id => id !== controllerId);
                        if (!opponentId) return false;
                        const yourCreatures = state.battlefield.filter((o: any) => o.controllerId === controllerId && o.definition.types.some((t: string) => t.toLowerCase() === 'creature')).length;
                        const opponentCreatures = state.battlefield.filter((o: any) => o.controllerId === opponentId && o.definition.types.some((t: string) => t.toLowerCase() === 'creature')).length;
                        return opponentCreatures > yourCreatures;
                    }
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-7' }],
            effects: [{
                type: EffectType.CreateEmblem,
                emblemBlueprint: {
                    name: "Garruk, Unleashed Emblem",
                    oracleText: "At the beginning of your end step, you may search your library for a creature card, put it onto the battlefield, then shuffle.",
                    abilities: [
                        {
                            eventMatch: TriggerEvent.EndStep,
                            condition: (state: any, event: any, trigger: any) => {
                                return state.activePlayerId === trigger.controllerId;
                            },
                            effects: [
                                {
                                    type: EffectType.Choice,
                                    label: "Search library for a creature card?",
                                    choices: [
                                        {
                                            label: "Yes",
                                            effects: [
                                                {
                                                    type: EffectType.SearchLibrary,
                                                    label: "Search for a creature card",
                                                    targetDefinition: {
                                                        type: TargetType.Creature,
                                                        count: 1,
                                                        minCount: 0,
                                                        optional: true,
                                                        sourceZones: [Zone.Library]
                                                    }
                                                },
                                                { type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.Target1 }
                                            ]
                                        },
                                        {
                                            label: "No",
                                            effects: []
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }]
        }
    ]
};


