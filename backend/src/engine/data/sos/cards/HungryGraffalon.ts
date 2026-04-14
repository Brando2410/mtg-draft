import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const HungryGraffalon: CardDefinition = {
    "name": "Hungry Graffalon",
    "manaCost": "{3}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Giraffe"
    ],
    "oracleText": "Reach\nIncrement (Whenever you cast a spell, if the amount of mana you spent is greater than this creature's power or toughness, put a +1/+1 counter on this creature.)",
    "keywords": ["Reach"],
    "abilities": [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            triggerCondition: 'INCREMENT_CHECK',
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: 'plus1plus1',
                    amount: 1,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    "power": "3",
    "toughness": "4"
};
