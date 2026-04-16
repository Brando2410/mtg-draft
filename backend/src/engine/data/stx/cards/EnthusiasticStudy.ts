import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const EnthusiasticStudy: CardDefinition = {
      name: 'Enthusiastic Study',
      manaCost: '{1}{R}',
      colors: ['R'],
      types: ['Instant'],
      oracleText: "Target creature gets +3/+1 and gains trample until end of turn. Learn.",
      abilities: [
          {
              type: AbilityType.Spell,
              targetDefinition: {
                  count: 1,
                  type: TargetType.Permanent,
                  restrictions: [{ type: 'Type', value: 'Creature' }]
              },
              effects: [
                  {
                      type: EffectType.ApplyContinuousEffect,
                      duration: 'UNTIL_END_OF_TURN',
                      powerModifier: 3,
                      toughnessModifier: 1,
                      abilitiesToAdd: ['Trample'],
                      targetMapping: TargetMapping.Target1
                  },
                  { type: EffectType.Learn }
              ]
          }
      ]
  };

