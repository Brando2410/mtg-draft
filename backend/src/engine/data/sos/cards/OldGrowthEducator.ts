import { TargetMapping, AbilityType, CardDefinition, ConditionType, EffectType, TargetType, TriggerEvent } from '@shared/engine_types';
export const OldGrowthEducator: CardDefinition = {
    name: "Old-Growth Educator",
    manaCost: "{2}{B}{G}",
    colors: [
        "B",
        "G"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Treefolk",
        "Druid"
    ],
    keywords: ["Vigilance", "Reach", "Infusion"],
    oracleText: "Vigilance, reach\nInfusion — When this creature enters, put two +1/+1 counters on it if you gained life this turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            condition: ConditionType.Infusion,
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: '+1/+1',
                    amount: 2,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    power: "4",
    toughness: "4"
};

