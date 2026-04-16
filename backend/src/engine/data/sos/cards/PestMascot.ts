import { AbilityType, CardDefinition, ConditionType, EffectType, TargetType, TriggerEvent } from '@shared/engine_types';
    export const PestMascot: CardDefinition = {
    name: "Pest Mascot",
    manaCost: "{1}{B}{G}",
    colors: [
        "B",
        "G"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Pest",
        "Ape"
    ],
    keywords: ["Trample"],
    oracleText: "Trample\nWhenever you gain life, put a +1/+1 counter on this creature.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.LifeGain,
            condition: ConditionType.PlayerIsController,
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: '+1/+1',
                    amount: 1,
                    targetMapping: TargetType.Self
                }
            ]
        }
    ],
    power: "2",
    toughness: "3"
};
    