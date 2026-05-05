import { AbilityType, CardDefinition, ConditionType, CostType, EffectType, Restriction, TargetMapping, TriggerEvent } from '@shared/engine_types';

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
                    restrictions: [Restriction.Zombie]
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            condition: `${ConditionType.IsYourTurn} && ${ConditionType.CreatureDiedThisTurn}`,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Pay {1}{B} to create a Zombie?",
                    optional: true,
                    choices: [
                        {
                            label: "Pay {1}{B}",
                            costs: [{ type: CostType.Mana, value: '{1}{B}' }],
                            effects: [
                                {
                                    type: EffectType.CreateToken,
                                    tokenBlueprint: {
                                        name: 'Zombie',
                                        power: 2,
                                        toughness: 2,
                                        colors: ['B'],
                                        types: ['Creature'],
                                        subtypes: ['Zombie'],
                                        image_url: 'https://cards.scryfall.io/large/front/4/5/453051e4-f3c5-4089-9fc0-ac064436798b.jpg?1594733596'
                                    },
                                    targetMapping: TargetMapping.Controller
                                }
                            ]
                        }
                    ],
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
