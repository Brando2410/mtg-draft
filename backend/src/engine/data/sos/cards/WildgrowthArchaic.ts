import { AbilityType, CardDefinition, ConditionType, DurationType, DynamicAmount, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const WildgrowthArchaic: CardDefinition = {
    name: "Wildgrowth Archaic",
    manaCost: "{2/G}{2/G}",


    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Avatar"],
    power: "0",
    toughness: "0",
    keywords: ["Trample", "Reach"],
    oracleText: "Trample, reach\nConverge — This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.\nWhenever you cast a creature spell, that creature enters with X additional +1/+1 counters on it, where X is the number of colors of mana spent to cast it.",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.EntersWithCounters,
                    amount: DynamicAmount.ConvergeAmount,
                    counterType: '+1/+1',
                    targetMapping: TargetMapping.Self
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: `${ConditionType.PlayerIsController} && ${ConditionType.SpellIsCreature}`,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.TriggerEventSource,
                    abilitiesToAdd: [
                        {
                            type: AbilityType.Static,
                            effects: [
                                {
                                    type: EffectType.EntersWithCounters,
                                    amount: DynamicAmount.ConvergeAmount,
                                    counterType: '+1/+1',
                                    targetMapping: TargetMapping.Self
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "d1861bc6-93d5-4b09-a5dd-94c0a0629e5f",
    image_url: "https://cards.scryfall.io/normal/front/d/1/d1861bc6-93d5-4b09-a5dd-94c0a0629e5f.jpg?1775939082",
    rarity: "rare"
};

