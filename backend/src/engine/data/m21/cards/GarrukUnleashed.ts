import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone, ConditionType } from '@shared/engine_types';

export const GarrukUnleashed: CardDefinition = {
    name: "Garruk, Unleashed",
    manaCost: "{2}{G}{G}",
    scryfall_id: "af2fdbec-bca2-4af5-9c2a-28b0b35b18a3",
    image_url: "https://cards.scryfall.io/normal/front/a/f/af2fdbec-bca2-4af5-9c2a-28b0b35b18a3.jpg?1594736982",
    oracleText: "+1: Up to one target creature gets +3/+3 and gains trample until end of turn.\n−2: Create a 3/3 green Beast creature token. Then if an opponent controls more creatures than you, put a loyalty counter on Garruk.\n−7: You get an emblem with \"At the beginning of your end step, you may search your library for a creature card, put it onto the battlefield, then shuffle.\"",
    colors: ["G"],
    supertypes: ["Legendary"],
    types: ["Planeswalker"],
    subtypes: ["Garruk"],
    loyalty: "4",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: 1 }],
            targetDefinition: { type: TargetType.Creature, count: 1, minCount: 0 },
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                powerModifier: 3,
                toughnessModifier: 3,
                abilitiesToAdd: ['Trample'],
                targetMapping: TargetMapping.Target1
            }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: -2 }],
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Beast',
                        power: '3',
                        toughness: '3',
                        colors: ['G'],
                        types: ['Creature'],
                        subtypes: ['Beast'],
                        image_url: 'https://cards.scryfall.io/large/front/4/e/4e178129-8422-42fe-bed1-073f114620f4.jpg?1594733661'
                    },
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.AddCounters,
                    counterType: 'loyalty',
                    amount: 1,
                    targetMapping: TargetMapping.Self,
                    condition: 'OPPONENT_CONTROLS_MORE_CREATURES_THAN_YOU'
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: -7 }],
            effects: [{
                type: EffectType.CreateEmblem,
                emblemBlueprint: {
                    name: 'Garruk, Unleashed Emblem',
                    image_url: 'https://cards.scryfall.io/large/front/a/1/a164c679-dec5-4da8-9614-722166a08605.jpg?1594733811',
                    abilities: [
                        {
                            type: AbilityType.Triggered,
                            eventMatch: TriggerEvent.EndStep,
                            condition: ConditionType.IsYourTurn,
                            effects: [
                                {
                                    type: EffectType.SearchLibrary,
                                    targetDefinition: { type: TargetType.Creature, count: 1 },
                                    zone: Zone.Battlefield,
                                    optional: true,
                                    targetMapping: TargetMapping.Controller
                                }
                            ]
                        }
                    ]
                }
            }]
        }
    ]
};
