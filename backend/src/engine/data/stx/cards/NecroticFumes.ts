import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const NecroticFumes: CardDefinition = {
    name: 'Necrotic Fumes',
    manaCost: '{1}{B}',
    colors: ['B'],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'As an additional cost to cast this spell, exile a creature you control.\nExile target creature or planeswalker.',
    abilities: [
      {
          type: AbilityType.Spell,
          additionalCosts: [
              {
                  type: 'Exile', 
                  restriction: { type: 'Type', value: 'Creature', source: 'CONTROLLER' }
              }
          ],
          targetDefinition: {
              count: 1,
              type: TargetType.Permanent,
              restrictions: [{ type: 'Any', restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Type', value: 'Planeswalker' }] }]
          },
          effects: [{ type: EffectType.Exile, targetMapping: TargetMapping.Target1 }]
      }
    ]
  };
