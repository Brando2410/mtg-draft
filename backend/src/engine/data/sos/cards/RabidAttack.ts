import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
export const RabidAttack: CardDefinition = {
    name: "Rabid Attack",
    manaCost: "{1}{B}",
    colors: ["B"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Until end of turn, any number of target creatures you control each get +1/+0 and gain \"When this creature dies, draw a card.\"",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Creature,
                restrictions: [Restriction.YouControl],
                count: 'ANY'
            }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    toughnessModifier: 0,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.TargetAll,
                    abilitiesToAdd: [
                        {
                            type: AbilityType.Triggered,
                            eventMatch: TriggerEvent.Death,
                            effects: [
                                {
                                    type: EffectType.DrawCards,
                                    amount: 1,
                                    targetMapping: TargetMapping.Controller
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "f5e67560-3135-4b27-a344-5859edf8bcd9",
    image_url: "https://cards.scryfall.io/normal/front/f/5/f5e67560-3135-4b27-a344-5859edf8bcd9.jpg?1775937579",
    rarity: "uncommon"
};

