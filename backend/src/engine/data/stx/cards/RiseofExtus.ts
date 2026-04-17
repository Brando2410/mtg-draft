import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const RiseofExtus: CardDefinition = {
  name: 'Rise of Extus',
  manaCost: '{4}{B/G}{B/G}',
  colors: ['B', 'G'],
  types: ['Sorcery'],
  oracleText: 'Exile target creature or planeswalker. Learn.',
  abilities: [
    {
      type: AbilityType.Spell,
      targetDefinition: {
        count: 1,
        type: TargetType.CreatureOrPlaneswalker,
      },
      effects: [
        { type: EffectType.Exile, targetMapping: TargetMapping.Target1 },
        { type: EffectType.Learn }
      ]
    }
  ]
};

