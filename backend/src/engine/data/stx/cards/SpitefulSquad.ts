import { AbilityType, CardDefinition, DynamicAmount, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const SpitefulSquad: CardDefinition = {
  name: 'Spiteful Squad',
  manaCost: '{3}{B}',
  colors: ['B'],
  types: ['Creature'],
  subtypes: ['Human', 'Warrior'],
  power: '3',
  toughness: '2',
  keywords: ['Deathtouch'],
  oracleText: 'Deathtouch\nWhen Spiteful Squad dies, put its +1/+1 counters on target creature you control.',
  abilities: [
    {
      type: AbilityType.Triggered,
      eventMatch: TriggerEvent.Death,
      targetDefinitions: [{
        count: 1,
        type: TargetType.Creature,
        restrictions: [Restriction.YouControl]
      }],
      effects: [{
        type: EffectType.AddCounters,
        counterType: 'P1P1',
        amount: DynamicAmount.SourceCountersP1P1,
        targetMapping: TargetMapping.Target1
      }]
    }
  ],
    scryfall_id: "be88355e-c986-4b69-93b4-0abf04916e86",
    image_url: "https://cards.scryfall.io/normal/front/b/e/be88355e-c986-4b69-93b4-0abf04916e86.jpg?1624740148",
    rarity: "common"
};

