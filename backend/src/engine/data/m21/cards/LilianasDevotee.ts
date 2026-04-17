import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const LilianasDevotee: CardDefinition = {
    name: "Liliana's Devotee",
    manaCost: "{2}{B}",
    scryfall_id: "ae5d7f15-a86f-4eaa-8280-2e7f73c8ce3a",
    image_url: "https://cards.scryfall.io/normal/front/a/e/ae5d7f15-a86f-4eaa-8280-2e7f73c8ce3a.jpg?1594736229",
    oracleText: "Zombies you control get +1/+0.\nAt the beginning of your end step, if a creature died this turn, you may pay {1}{B}. If you do, create a 2/2 black Zombie creature token.",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Human", "Warlock"],
    power: "2",
    toughness: "3",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                    restrictions: [
                { type: 'Type', value: 'Zombie' }
            ]
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            condition: (state: any, event: any, source: any) =>
                state.activePlayerId === source.controllerId &&
                state.turnState.creaturesDiedThisTurn.length > 0,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "You may pay {1}{B} to create a Zombie token",
                    choices: [
                        {
                            label: 'Pay {1}{B}',
                            effects: [
                                {
                                    type: EffectType.CreateToken,
                                    costs: [{ type: CostType.Mana, value: '{1}{B}' }],
                                    tokenBlueprint: {
                                        name: 'Zombie',
                                        power: 2,
                                        toughness: 2,
                                        colors: ['B'],
                                        types: ['Creature'],
                                        subtypes: ['Zombie']
                                    },
                                    targetMapping: TargetMapping.Controller
                                }
                            ]
                        },
                        { label: 'Do not pay', effects: [] }
                    ],
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};




