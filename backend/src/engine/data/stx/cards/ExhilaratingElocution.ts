import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const ExhilaratingElocution: CardDefinition = {
    name: 'Exhilarating Elocution',
    manaCost: '{2}{W}{B}',
    colors: ['W', 'B'],
    types: ['Sorcery'],
    oracleText: 'Put a +1/+1 counter on each creature you control.',
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [{ type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: TargetMapping.AllCreaturesYouControl }]
        }
    ]
  };
