import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const BayouGroff: CardDefinition = {
    name: 'Bayou Groff',
    manaCost: '{1}{G}',
    colors: ['G'],
    types: ['Creature'],
    subtypes: ['Dog', 'Plant'],
    power: '5',
    toughness: '4',
    oracleText: 'As an additional cost to cast this spell, sacrifice a creature or pay {3}.',
    abilities: [
      {
          type: AbilityType.Spell,
          additionalCosts: [
              {
                  label: "As an additional cost to cast this spell, sacrifice a creature or pay {3}.",
                  type: 'Choice',
                  choices: [
                      { label: 'Sacrifice a creature', costs: [{ type: 'Sacrifice', targetMapping: TargetMapping.Target1, targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }] } }] },
                      { label: 'Pay {3}', costs: [{ type: 'Mana', value: '{3}' }] }
                  ]
              }
          ]
      }
    ]
  };
