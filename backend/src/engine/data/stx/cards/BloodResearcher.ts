import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const BloodResearcher: CardDefinition = {
    name: 'Blood Researcher',
    manaCost: '{1}{B}{G}',
    colors: ['B', 'G'],
    types: ['Creature'],
    subtypes: ['Vampire', 'Druid'],
    power: "2",
    toughness: "2",
    keywords: ['Menace'],
    oracleText: 'Menace\nWhenever you gain life, put a +1/+1 counter on Blood Researcher.',
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.LifeGain,
            condition: 'YouGainedLife',
            effects: [{ type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: TargetMapping.Self }]
        }
    ]
  };

