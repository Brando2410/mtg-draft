import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const ClaimtheFirstborn: CardDefinition = {
  name: 'Claim the Firstborn',
  manaCost: '{R}',
  colors: ['R'],
  types: ['Sorcery'],
  oracleText: 'Gain control of target creature with mana value 3 or less until end of turn. Untap that creature. It gains haste until end of turn.',
  abilities: [
    {
      type: AbilityType.Spell,
      targetDefinition: {
        count: 1,
        type: TargetType.Creature,
        restrictions: ["mv <= 3"]
      },
      effects: [
        { type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, effects: [{ type: EffectType.GainControl }], targetMapping: TargetMapping.Target1 },
        { type: EffectType.Untap, targetMapping: TargetMapping.Target1 },
        { type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, effects: [{ type: EffectType.GainKeyword, keyword: 'Haste' }], targetMapping: TargetMapping.Target1 }
      ]
    }
  ]
};

