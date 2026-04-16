import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const PrismariCharm: CardDefinition = {
  name: 'Prismari Charm',
  manaCost: '{U}{R}',
  colors: ['U', 'R'],
  types: ['Instant'],
  oracleText: 'Choose one —\n• Surveil 2, then draw a card.\n• Prismari Charm deals 1 damage to each of one or two targets.\n• Return target nonland permanent to its owner\'s hand.',
  abilities: [
    {
      type: AbilityType.Spell,
      effects: [
        {
          type: EffectType.Choice,
          label: 'Choose a mode:',
          choices: [
            {
              label: 'Surveil 2, then draw a card',
              effects: [
                { type: EffectType.Surveil, amount: 2 },
                { type: EffectType.DrawCards, amount: 1 }
              ]
            },
            {
              label: 'Deal 1 damage to each of one or two targets',
              targetDefinition: {
                count: 2,
                minCount: 1,
                type: TargetType.AnyTarget,
              },
              effects: [
                {
                  type: EffectType.DealDamage,
                  amount: 1,
                  targetMapping: TargetMapping.TargetAll
                }
              ]
            },
            {
              label: 'Return target nonland permanent to its owner\'s hand',
              targetDefinition: {
                type: TargetType.Permanent,
                restrictions: ['nonland'],
              },
              effects: [
                {
                  type: EffectType.ReturnToHand,
                  targetMapping: TargetMapping.Target1
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};



