import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const Humiliate: CardDefinition = {
    name: 'Humiliate',
    manaCost: '{W}{B}',
    colors: ['W', 'B'],
    types: ['Sorcery'],
    oracleText: 'Target opponent reveals their hand. You choose a nonland card from it. That player discards that card. Put a +1/+1 counter on a creature you control.',
    abilities: [
      {
        type: AbilityType.Spell,
        targetDefinition: {
            count: 1,
            type: TargetType.Player,
            restrictions: [{ type: 'Opponent' }]
        },
        effects: [
          {
            type: EffectType.Choice,
            label: "Choose a nonland card to discard",
            targetIdMapping: 'TARGET_1_HAND_REVEAL_PICK',
            restrictions: [{ type: 'Not', restriction: { type: 'Type', value: 'Land' } }],
            effects: [{ type: EffectType.MoveToZone, zone: Zone.Graveyard, isDiscard: true }]
          },
          {
              type: EffectType.AddCounters,
              counterType: 'P1P1',
              amount: 1,
              targetDefinition: {
                  count: 1,
                  type: TargetType.Permanent,
                  restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Source', value: 'CONTROLLER' }]
              },
              targetMapping: TargetMapping.Target1
          }
        ]
      }
    ]
  };
