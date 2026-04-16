import { AbilityType, CardDefinition, ConditionType, DurationType, DynamicAmount, EffectType, TargetType, TriggerEvent } from '@shared/engine_types';
    export const WildgrowthArchaic: CardDefinition = {
    name: "Wildgrowth Archaic",
    manaCost: "{2/G}{2/G}",
    colors: [
        "G"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Avatar"
    ],
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
                    targetMapping: TargetType.Self
                }
            ]
        },
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastSpell,
            restrictions: ['Creature'],
            condition: ConditionType.PlayerIsController,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: DurationType.Permanent,
                    replacementEffect: {
                    eventMatch: TriggerEvent.EnterBattlefield,
                        condition: 'EVENT_OBJECT_IS_TRIGGER_SOURCE',
                        effects: [
                            {
                                type: EffectType.AddCounters,
                                amount: DynamicAmount.ConvergeAmount,
                                counterType: '+1/+1',
                                targetMapping: TargetType.Self
                            }
                        ]
                    }
                }
            ]
        }
    ],
    power: "0",
    toughness: "0"
};
    