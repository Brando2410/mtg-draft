import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

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
            type: TargetType.Permanent,
            restrictions: [
                { type: 'Type', value: 'Creature' },
                { type: 'Attribute', attribute: 'ManaValue', value: 3, comparison: 'LE' }
            ]
        },
        effects: [
          { type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', effects: [{ type: 'GainControl' }], targetMapping: TargetMapping.Target1 },
          { type: EffectType.Untap, targetMapping: TargetMapping.Target1 },
          { type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', effects: [{ type: 'GainKeyword', keyword: 'Haste' }], targetMapping: TargetMapping.Target1 }
        ]
      }
    ]
  };

