import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const GuidingVoice: CardDefinition = {
    name: 'Guiding Voice',
    manaCost: '{W}',
    scryfall_id: "d6fb3163-12ca-4a7f-a0c7-b8ddfc9408a0",
    image_url: "https://cards.scryfall.io/normal/front/d/6/d6fb3163-12ca-4a7f-a0c7-b8ddfc9408a0.jpg?1624589500",
    colors: ['W'],
    types: ['Sorcery'],
    oracleText: 'Put a +1/+1 counter on target creature.\nLearn.',
    abilities: [
      {
        type: AbilityType.Spell,
        targetDefinition: {
            count: 1,
            type: TargetType.Creature
        },
        effects: [
          { type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: TargetMapping.Target1 },
          { type: EffectType.Learn }
        ]
      }
    ]
  };
