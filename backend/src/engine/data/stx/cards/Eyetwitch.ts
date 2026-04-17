import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const Eyetwitch: CardDefinition = {
    name: 'Eyetwitch',
    manaCost: '{B}',
    scryfall_id: "1f4d1bb6-cb8f-4d01-9879-0b3a0585cbf4",
    image_url: "https://cards.scryfall.io/normal/front/1/f/1f4d1bb6-cb8f-4d01-9879-0b3a0585cbf4.jpg?1624590927",
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


