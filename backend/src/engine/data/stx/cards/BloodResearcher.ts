import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const BloodResearcher: CardDefinition = {
    name: 'Blood Researcher',
    manaCost: '{1}{B}{G}',
    scryfall_id: "3e35e9ba-a10e-4926-a7a6-3a65efc2a730",
    image_url: "https://cards.scryfall.io/normal/front/3/e/3e35e9ba-a10e-4926-a7a6-3a65efc2a730.jpg?1627428197",
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


