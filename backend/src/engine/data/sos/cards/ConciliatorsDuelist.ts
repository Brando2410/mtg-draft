import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const ConciliatorsDuelist: CardDefinition = {
    name: "Conciliator's Duelist",
    manaCost: "{W}{W}{B}{B}",


    colors: ["B", "W"],
    types: ["Creature"],
    subtypes: ["Kor", "Warlock"],
    keywords: [],
    oracleText: "When this creature enters, draw a card. Each player loses 1 life.\nRepartee — Whenever you cast an instant or sorcery spell that targets a creature, exile up to one target creature. Return that card to the battlefield under its owner's control at the beginning of the next end step.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller },
                { type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.EachPlayer }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: ConditionType.ReparteeTrigger,
            effects: [
                {
                    type: EffectType.Choice,
                    optional: true,
                    choices: [
                        {
                            label: "Exile up to one target creature?",
                            targetDefinitions: [{ type: TargetType.Creature, count: 1, minCount: 0, optional: true }],
                            effects: [
                                {
                                    type: EffectType.Exile,
                                    targetMapping: TargetMapping.Target1,
                                    effects: [
                                        {
                                            type: EffectType.CreateDelayedTrigger,
                                            eventMatch: TriggerEvent.EndStep,
                                            effects: [{ type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.Target1 }]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    power: "4",
    toughness: "3",
    scryfall_id: "e225929b-6197-4550-969e-3c4a97206a68",
    image_url: "https://cards.scryfall.io/normal/front/e/2/e225929b-6197-4550-969e-3c4a97206a68.jpg?1775938257",
    rarity: "rare"
};

