import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const WildgrowthArchaic: CardDefinition = {
    "name": "Wildgrowth Archaic",
    "manaCost": "{2/G}{2/G}",
    "colors": [
        "G"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Avatar"
    ],
    "keywords": ["Trample", "Reach"],
    "oracleText": "Trample, reach\nConverge — This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.\nWhenever you cast a creature spell, that creature enters with X additional +1/+1 counters on it, where X is the number of colors of mana spent to cast it.",
    "abilities": [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.EntersWithCounters,
                    amount: 'CONVERGE_AMOUNT',
                    counterType: 'p1p1',
                    targetMapping: TargetMapping.Self
                }
            ]
        },
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastSpell,
            restrictions: [{ type: 'Type', value: 'Creature' }],
            condition: 'PLAYER_IS_CONTROLLER',
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: 'PERMANENT',
                    replacementEffect: {
                    eventMatch: TriggerEvent.EnterBattlefield,
                        condition: 'EVENT_OBJECT_IS_TRIGGER_SOURCE',
                        effects: [
                            {
                                type: EffectType.AddCounters,
                                amount: 'CONVERGE_AMOUNT',
                                counterType: 'p1p1',
                                targetMapping: TargetMapping.Self
                            }
                        ]
                    }
                }
            ]
        }
    ],
    "power": "0",
    "toughness": "0"
};





