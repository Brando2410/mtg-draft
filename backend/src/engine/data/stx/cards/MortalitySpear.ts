import { AbilityType, CardDefinition, DynamicAmount, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const MortalitySpear: CardDefinition = {
  name: 'Mortality Spear',
  manaCost: '{2}{B}{G}',
  colors: ['B', 'G'],
  types: ['Instant'],
  oracleText: 'This spell costs {2} less to cast if you gained life this turn.\nDestroy target nonland permanent.',
  abilities: [
    {
      type: AbilityType.Static,
      effects: [{
        type: EffectType.CostReduction,
        amount: '{2}',
        condition: 'LifeGainedThisTurn'
      }]
    },
    {
      type: AbilityType.Spell,
      targetDefinition: {
        count: 1,
        type: TargetType.Permanent,
        restrictions: [Restriction.NonLand]
      },
      effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
    }
  ]
};

