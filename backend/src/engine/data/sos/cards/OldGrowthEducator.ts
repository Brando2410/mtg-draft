import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const OldGrowthEducator: CardDefinition = {
    "name": "Old-Growth Educator",
    "manaCost": "{2}{B}{G}",
    "colors": [
        "B",
        "G"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Treefolk",
        "Druid"
    ],
    "oracleText": "Vigilance, reach\nInfusion — When this creature enters, put two +1/+1 counters on it if you gained life this turn.",
    "keywords": ["Vigilance", "Reach", "Infusion"],
    "abilities": [
        {
            type: AbilityType.Triggered,
            id: "Infusion",
                    eventMatch: TriggerEvent.EnterBattlefield,
            condition: 'INFUSION',
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: 'p1p1',
                    amount: 2,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    "power": "4",
    "toughness": "4"
};




