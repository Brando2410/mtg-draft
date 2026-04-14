import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const Eyetwitch: CardDefinition = {
    name: 'Eyetwitch',
    manaCost: '{B}',
    colors: ['B'],
    types: ['Creature'],
    subtypes: ['Eye'],
    power: '1',
    toughness: '1',
    keywords: ['Flying'],
    oracleText: 'Flying\nWhen Eyetwitch dies, learn.',
    abilities: [
      {
        type: AbilityType.Triggered,
        eventMatch: TriggerEvent.Death,
        effects: [{ type: EffectType.Learn }]
      }
    ]
  };
