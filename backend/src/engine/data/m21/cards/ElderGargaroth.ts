import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const ElderGargaroth: CardDefinition = {
    name: "Elder Gargaroth",
    manaCost: "{3}{G}{G}",
    scryfall_id: "d51269cf-a333-4a64-94cd-245798d840d2",
    image_url: "https://cards.scryfall.io/normal/front/d/5/d51269cf-a333-4a64-94cd-245798d840d2.jpg?1594736944",
    oracleText: "Vigilance, reach, trample\nWhenever Elder Gargaroth attacks or blocks, choose one —\n• Create a 3/3 green Beast creature token.\n• You gain 3 life.\n• Draw a card.",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Beast"],
    power: "6",
    toughness: "6",
    keywords: ["Vigilance", "Reach", "Trample"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.AttackOrBlock,
            condition: ConditionType.EventObjectIsTriggerSource,
            effects: [{
                type: EffectType.Choice,
                choices: [
                    {
                        label: "Create a 3/3 green Beast creature token",
                        effects: [{
                            type: EffectType.CreateToken,
                            tokenBlueprint: {
                                name: 'Beast', power: '3', toughness: '3', colors: ['G'],
                                types: ['Creature'], subtypes: ['Beast'],
                                image_url: 'https://cards.scryfall.io/large/front/4/e/4e178129-8422-42fe-bed1-073f114620f4.jpg?1594733661'
                            },
                            targetMapping: TargetMapping.Controller
                        }]
                    },
                    {
                        label: "Gain 3 life",
                        effects: [{
                            type: EffectType.GainLife,
                            amount: 3,
                            targetMapping: TargetMapping.Controller
                        }]
                    },
                    {
                        label: "Draw a card",
                        effects: [{
                            type: EffectType.DrawCards,
                            amount: 1,
                            targetMapping: TargetMapping.Controller
                        }]
                    }
                ],
            }]
        }
    ]
};
